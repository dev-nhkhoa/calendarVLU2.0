import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'
import { CalendarServiceError, CalendarServiceErrorCode } from '@/services/errors'
import * as vluClient from '@/services/vlu-client'

describe('POST /api/extension/vlu/check-session', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
    process.env.VLU_HOME_URL = 'https://online.vlu.edu.vn/Home'
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '<html />' }) as jest.Mock
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uses configured VLU_HOME_URL and ignores caller-controlled baseUrl', async () => {
    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/vlu/check-session', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
        body: JSON.stringify({
          vlu: {
            baseUrl: 'https://evil.test/steal-cookies',
            cookies: [{ name: 'ASP.NET_SessionId', value: 'secret-cookie' }],
            selectedCookieHeader: 'ASP.NET_SessionId=secret-cookie',
          },
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://online.vlu.edu.vn/Home/DrawingStudentSchedule_Perior'),
      expect.objectContaining({ headers: { Cookie: 'ASP.NET_SessionId=secret-cookie' } }),
    )
    expect((global.fetch as jest.Mock).mock.calls[0][0]).not.toContain('evil.test')
  })

  it('returns 400 for invalid cookie format', async () => {
    jest.spyOn(vluClient, 'fetchRawVluCalendar').mockImplementation(async () => {
      throw new CalendarServiceError(CalendarServiceErrorCode.InvalidCookie, 'Invalid cookie', 400)
    })

    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/vlu/check-session', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
        body: JSON.stringify({
          vlu: {
            cookies: [{ name: 'ASP.NET_SessionId', value: 'bad value with space' }],
            selectedCookieHeader: 'ASP.NET_SessionId=bad value with space',
          },
        }),
      }),
    )

    expect(response.status).toBe(400)
  })
})
