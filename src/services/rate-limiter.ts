import { Redis } from '@upstash/redis'

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const redis = UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null

const inMemoryBuckets = new Map<string, { count: number; resetAt: number }>()
let redisAvailable = redis !== null
let lastRedisCheck = 0
const REDIS_CHECK_INTERVAL = 30_000

function getRedis(): Redis | null {
  if (!redis) return null
  if (!redisAvailable) {
    if (Date.now() - lastRedisCheck < REDIS_CHECK_INTERVAL) return null
    lastRedisCheck = Date.now()
    return redis
  }
  return redis
}

async function checkRateLimitRedis(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const r = getRedis()
  if (!r) return false

  try {
    const now = Date.now()
    const windowKey = `rate_limit:${key}:${Math.floor(now / windowMs)}`

    const count = await r.incr(windowKey)
    if (count === 1) {
      await r.expire(windowKey, Math.ceil(windowMs / 1000))
    }

    redisAvailable = true
    return count <= maxRequests
  } catch {
    redisAvailable = false
    lastRedisCheck = Date.now()
    return false
  }
}

function checkRateLimitInMemory(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const current = inMemoryBuckets.get(key)

  if (!current || current.resetAt <= now) {
    inMemoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) return false

  current.count += 1
  return true
}

export async function checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  if (redis) {
    const redisResult = await checkRateLimitRedis(key, maxRequests, windowMs)
    if (redisResult) return true
    if (redisAvailable) return false
  }

  return checkRateLimitInMemory(key, maxRequests, windowMs)
}

export function resetRateLimitsForTests(): void {
  inMemoryBuckets.clear()
  redisAvailable = redis !== null
  lastRedisCheck = 0
}
