import { Redis } from '@upstash/redis'

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const redis = UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null

const FAILURE_COUNTER_KEY = 'audit:failure_counters'

let redisAvailable = redis !== null
let lastRedisCheck = 0
const REDIS_CHECK_INTERVAL = 30_000

const inMemoryCounters = {
  vluFetchFailures: 0,
  parserFailures: 0,
  googleSyncFailures: 0,
  totalRequests: 0,
  lastFailure: null as { action: string; message: string; time: string } | null,
}

interface FailureCounterData {
  vluFetchFailures: number
  parserFailures: number
  googleSyncFailures: number
  totalRequests: number
  lastFailure: { action: string; message: string; time: string } | null
}

function getRedis(): Redis | null {
  if (!redis) return null
  if (!redisAvailable) {
    if (Date.now() - lastRedisCheck < REDIS_CHECK_INTERVAL) return null
    lastRedisCheck = Date.now()
    return redis
  }
  return redis
}

async function persistCounter(key: string, value: number): Promise<void> {
  const r = getRedis()
  if (!r) return
  try {
    await r.hset(FAILURE_COUNTER_KEY, { [key]: value })
    redisAvailable = true
  } catch {
    redisAvailable = false
    lastRedisCheck = Date.now()
  }
}

async function readRedisCounters(): Promise<FailureCounterData | null> {
  const r = getRedis()
  if (!r) return null
  try {
    const data = await r.hgetall(FAILURE_COUNTER_KEY) as Record<string, unknown> | null
    redisAvailable = true
    if (!data) return null
    return {
      vluFetchFailures: Number(data.vluFetchFailures) || 0,
      parserFailures: Number(data.parserFailures) || 0,
      googleSyncFailures: Number(data.googleSyncFailures) || 0,
      totalRequests: Number(data.totalRequests) || 0,
      lastFailure: data.lastFailure ? JSON.parse(data.lastFailure as string) : null,
    }
  } catch {
    redisAvailable = false
    lastRedisCheck = Date.now()
    return null
  }
}

export interface AuditEntry {
  timestamp: string
  action: string
  status: number
  durationMs: number
  requestId?: string
  origin?: string
  method?: string
  path?: string
}

export interface FailureCounter {
  vluFetchFailures: number
  parserFailures: number
  googleSyncFailures: number
  totalRequests: number
  lastFailure: { action: string; message: string; time: string } | null
}

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const sensitiveKeys = ['cookie', 'authorization', 'set-cookie', 'x-api-key', 'token']
  const redacted: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase()
    if (sensitiveKeys.some((s) => lower.includes(s))) {
      redacted[key] = '[REDACTED]'
    } else if (lower === 'host' || lower === 'origin' || lower === 'referer') {
      redacted[key] = value
    } else {
      redacted[key] = value
    }
  }
  return redacted
}

function redactedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return '[INVALID_URL]'
  }
}

export function logAuditEntry(entry: AuditEntry): void {
  inMemoryCounters.totalRequests += 1
  persistCounter('totalRequests', inMemoryCounters.totalRequests)

  if (process.env.NODE_ENV === 'production' || process.env.AUDIT_LOG === '1') {
    const safeEntry = {
      ...entry,
      headers: undefined,
      body: undefined,
    }
    console.log(JSON.stringify({ type: 'audit', ...safeEntry }))
  }
}

export function recordFailure(action: string, message: string): void {
  const time = new Date().toISOString()
  inMemoryCounters.lastFailure = { action, message, time }

  if (action === 'vlu_fetch') {
    inMemoryCounters.vluFetchFailures += 1
    persistCounter('vluFetchFailures', inMemoryCounters.vluFetchFailures)
  } else if (action === 'parser') {
    inMemoryCounters.parserFailures += 1
    persistCounter('parserFailures', inMemoryCounters.parserFailures)
  } else if (action === 'google_sync') {
    inMemoryCounters.googleSyncFailures += 1
    persistCounter('googleSyncFailures', inMemoryCounters.googleSyncFailures)
  }

  console.warn(JSON.stringify({ type: 'failure', action, message, time }))
}

export async function getFailureCounters(): Promise<FailureCounter> {
  const redisCounters = await readRedisCounters()
  if (redisCounters) {
    inMemoryCounters.vluFetchFailures = redisCounters.vluFetchFailures
    inMemoryCounters.parserFailures = redisCounters.parserFailures
    inMemoryCounters.googleSyncFailures = redisCounters.googleSyncFailures
    inMemoryCounters.totalRequests = redisCounters.totalRequests
    inMemoryCounters.lastFailure = redisCounters.lastFailure
    return { ...redisCounters }
  }
  return { ...inMemoryCounters }
}

export function resetFailureCountersForTests(): void {
  inMemoryCounters.vluFetchFailures = 0
  inMemoryCounters.parserFailures = 0
  inMemoryCounters.googleSyncFailures = 0
  inMemoryCounters.totalRequests = 0
  inMemoryCounters.lastFailure = null
}

export { redactHeaders, redactedUrl }
