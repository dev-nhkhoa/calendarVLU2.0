import { guardExtensionRequest, readLimitedJson, resetExtensionRateLimitsForTests } from '../extension-api'

describe('extension-api guards', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
  })

  it('rejects non-allowlisted origins', async () => {
    const request = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
      method: 'POST',
      headers: { origin: 'https://evil.test' },
    })

    const guard = guardExtensionRequest(request)

    expect(guard.ok).toBe(false)
    if (!guard.ok) {
      expect(guard.response.status).toBe(403)
      await expect(guard.response.json()).resolves.toMatchObject({ error: { code: 'ORIGIN_NOT_ALLOWED' } })
    }
  })

  it('allows chrome extension origins', () => {
    const request = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
      method: 'POST',
      headers: { origin: 'chrome-extension://abc123' },
    })

    expect(guardExtensionRequest(request).ok).toBe(true)
  })

  it('rate limits repeated client requests', async () => {
    const buildRequest = () =>
      new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
      })

    expect(guardExtensionRequest(buildRequest(), { rateLimit: { maxRequests: 1, windowMs: 60_000 } }).ok).toBe(true)
    const guard = guardExtensionRequest(buildRequest(), { rateLimit: { maxRequests: 1, windowMs: 60_000 } })

    expect(guard.ok).toBe(false)
    if (!guard.ok) {
      expect(guard.response.status).toBe(429)
      await expect(guard.response.json()).resolves.toMatchObject({ error: { code: 'RATE_LIMITED' } })
    }
  })

  it('rejects oversized JSON bodies', async () => {
    const request = new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
      method: 'POST',
      body: JSON.stringify({ large: 'x'.repeat(100) }),
    })

    await expect(readLimitedJson(request, 10)).rejects.toThrow('REQUEST_TOO_LARGE')
  })
})
