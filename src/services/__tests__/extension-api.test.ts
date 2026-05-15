import { guardExtensionRequest, handleOptionsRequest, isAllowedOrigin, readLimitedJson, resetExtensionRateLimitsForTests, resolveCorsOrigin } from '../extension-api'

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

    const guard = await guardExtensionRequest(request)

    expect(guard.ok).toBe(false)
    if (!guard.ok) {
      expect(guard.response.status).toBe(403)
      await expect(guard.response.json()).resolves.toMatchObject({ error: { code: 'ORIGIN_NOT_ALLOWED' } })
    }
  })

  it('rejects random chrome extension origins unless explicitly allowlisted', async () => {
    const request = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
      method: 'POST',
      headers: { origin: 'chrome-extension://abc123' },
    })

    expect(isAllowedOrigin('chrome-extension://abc123')).toBe(false)
    expect((await guardExtensionRequest(request)).ok).toBe(false)
  })

  it('allows exact chrome extension origins from the allowlist', async () => {
    process.env.EXTENSION_ALLOWED_ORIGINS = 'chrome-extension://prod123,https://calendarvlu.test'

    const request = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
      method: 'POST',
      headers: { origin: 'chrome-extension://prod123' },
    })

    expect(isAllowedOrigin('chrome-extension://prod123')).toBe(true)
    expect((await guardExtensionRequest(request)).ok).toBe(true)
  })

  it('allows chrome extension origins in development when no explicit allowlist is configured', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    delete process.env.EXTENSION_ALLOWED_ORIGINS
    process.env.NODE_ENV = 'development'

    try {
      const request = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
        method: 'POST',
        headers: { origin: 'chrome-extension://devextensionid' },
      })

      expect(isAllowedOrigin('chrome-extension://devextensionid')).toBe(true)
      expect((await guardExtensionRequest(request)).ok).toBe(true)
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })

  it('allows chrome extension origins in development even when local web origin is configured', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.EXTENSION_ALLOWED_ORIGINS = 'http://localhost:3000'
    process.env.NODE_ENV = 'development'

    try {
      const request = new Request('https://calendarvlu.test/api/extension/google/status', {
        method: 'GET',
        headers: { origin: 'chrome-extension://devextensionid' },
      })

      expect(isAllowedOrigin('chrome-extension://devextensionid')).toBe(true)
      expect((await guardExtensionRequest(request)).ok).toBe(true)
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })

  it('does not trust the extension client header as an origin bypass', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    const disallowedOrigin = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
      method: 'POST',
      headers: { origin: 'https://evil.test', 'X-CalendarVLU-Client': 'extension' },
    })
    const missingOrigin = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
      method: 'POST',
      headers: { 'X-CalendarVLU-Client': 'extension' },
    })

    try {
      expect((await guardExtensionRequest(disallowedOrigin)).ok).toBe(false)
      expect((await guardExtensionRequest(missingOrigin)).ok).toBe(true)
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })

  it('allows extension client requests without origin in development', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    try {
      const request = new Request('https://calendarvlu.test/api/extension/health', {
        method: 'GET',
        headers: { 'X-CalendarVLU-Client': 'extension' },
      })

      expect((await guardExtensionRequest(request)).ok).toBe(true)
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })

  it('allows extension client requests without origin in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      const request = new Request('https://calendarvlu.test/api/extension/health', {
        headers: { 'X-CalendarVLU-Client': 'extension' },
      })

      expect((await guardExtensionRequest(request)).ok).toBe(true)
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })

  it('does not return a credentialed CORS origin for disallowed origins', () => {
    const request = new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
      method: 'OPTIONS',
      headers: { origin: 'https://evil.test' },
    })
    const response = handleOptionsRequest(request)

    expect(resolveCorsOrigin('https://evil.test', request)).toBe('null')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('null')
  })

  it('rate limits repeated client requests', async () => {
    const buildRequest = () =>
      new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
      })

    expect((await guardExtensionRequest(buildRequest(), { rateLimit: { maxRequests: 1, windowMs: 60_000 } })).ok).toBe(true)
    const guard = await guardExtensionRequest(buildRequest(), { rateLimit: { maxRequests: 1, windowMs: 60_000 } })

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
