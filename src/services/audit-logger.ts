/**
 * Redacted audit logger for production observability.
 * Never logs cookies, tokens, passwords, or raw response bodies.
 */

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

const failureCounters: FailureCounter = {
  vluFetchFailures: 0,
  parserFailures: 0,
  googleSyncFailures: 0,
  totalRequests: 0,
  lastFailure: null,
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
  failureCounters.totalRequests += 1

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
  failureCounters.lastFailure = { action, message, time }

  if (action === 'vlu_fetch') failureCounters.vluFetchFailures += 1
  else if (action === 'parser') failureCounters.parserFailures += 1
  else if (action === 'google_sync') failureCounters.googleSyncFailures += 1

  console.warn(JSON.stringify({ type: 'failure', action, message, time }))
}

export function getFailureCounters(): FailureCounter {
  return { ...failureCounters }
}

export function resetFailureCountersForTests(): void {
  failureCounters.vluFetchFailures = 0
  failureCounters.parserFailures = 0
  failureCounters.googleSyncFailures = 0
  failureCounters.totalRequests = 0
  failureCounters.lastFailure = null
}

export { redactHeaders, redactedUrl }
