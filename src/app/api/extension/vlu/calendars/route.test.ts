import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

function buildRow(cells: string[]) {
  return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
}

describe('POST /api/extension/vlu/calendars', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => `<table><tbody>${buildRow(['', '', 'Lap Trinh Web', '', '', 'Hai', '1 - 2', 'A101', 'Nguyen Van A', '1', ''])}</tbody></table>`,
    }) as jest.Mock
  })

  it('fetches VLU data with request-scoped cookies and returns normalized events', async () => {
    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
        body: JSON.stringify({
          vlu: {
            baseUrl: 'https://online.vlu.edu.vn',
            cookies: [{ name: 'ASP.NET_SessionId', value: 'secret-cookie' }],
          },
          filters: {
            types: ['study'],
            termId: 'HK01',
            yearStudy: '2025-2026',
          },
        }),
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      diagnostics: { source: 'vlu', eventCount: 1 },
      events: [{ summary: 'Lap Trinh Web', startDate: '08/09/2025' }],
    })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://online.vlu.edu.vn/DrawingStudentSchedule_Perior?YearStudy=2025-2026&TermID=HK01',
      expect.objectContaining({ headers: { Cookie: 'ASP.NET_SessionId=secret-cookie' } }),
    )
  })

  it('maps expired VLU sessions to COOKIE_EXPIRED without returning raw cookies', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 302, text: async () => '' }) as jest.Mock

    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
        body: JSON.stringify({
          vlu: {
            baseUrl: 'https://online.vlu.edu.vn',
            cookies: [{ name: 'ASP.NET_SessionId', value: 'secret-cookie' }],
          },
          filters: {
            types: ['study'],
            termId: 'HK01',
            yearStudy: '2025-2026',
          },
        }),
      }),
    )

    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload).toMatchObject({ error: { code: 'COOKIE_EXPIRED' } })
    expect(JSON.stringify(payload)).not.toContain('secret-cookie')
  })
})
