import { logAuditEntry, recordFailure, getFailureCounters, resetFailureCountersForTests, redactHeaders, redactedUrl } from '../audit-logger'

describe('redactHeaders', () => {
  it('redacts sensitive headers', () => {
    const headers = { cookie: 'secret', authorization: 'Bearer token123', host: 'example.com', 'x-custom': 'visible' }
    const redacted = redactHeaders(headers)
    expect(redacted.cookie).toBe('[REDACTED]')
    expect(redacted.authorization).toBe('[REDACTED]')
    expect(redacted.host).toBe('example.com')
    expect(redacted['x-custom']).toBe('visible')
  })
})

describe('redactedUrl', () => {
  it('strips query parameters from URLs', () => {
    expect(redactedUrl('https://example.com/path?secret=abc&token=def')).toBe('https://example.com/path')
  })

  it('handles invalid URLs gracefully', () => {
    expect(redactedUrl('not a url')).toBe('[INVALID_URL]')
  })
})

describe('failure counting', () => {
  beforeEach(() => {
    resetFailureCountersForTests()
  })

  it('tracks VLU fetch failures', () => {
    recordFailure('vlu_fetch', 'VLU unavailable')
    const counters = getFailureCounters()
    expect(counters.vluFetchFailures).toBe(1)
    expect(counters.lastFailure?.action).toBe('vlu_fetch')
  })

  it('tracks parser failures', () => {
    recordFailure('parser', 'Invalid HTML')
    expect(getFailureCounters().parserFailures).toBe(1)
  })

  it('tracks Google sync failures', () => {
    recordFailure('google_sync', 'Token expired')
    expect(getFailureCounters().googleSyncFailures).toBe(1)
  })

  it('tracks total requests via audit logs', () => {
    logAuditEntry({ action: 'fetch_calendar', status: 200, durationMs: 100, timestamp: new Date().toISOString() })
    expect(getFailureCounters().totalRequests).toBe(1)
  })

  it('resets counters for tests', () => {
    recordFailure('vlu_fetch', 'err')
    resetFailureCountersForTests()
    const counters = getFailureCounters()
    expect(counters.vluFetchFailures).toBe(0)
    expect(counters.parserFailures).toBe(0)
    expect(counters.googleSyncFailures).toBe(0)
  })
})
