import { CalendarServiceError, CalendarServiceErrorCode } from '../errors'
import { fetchRawVluCalendar, resolveVluBaseUrl } from '../vlu-client'

describe('resolveVluBaseUrl', () => {
  const originalVluHomeUrl = process.env.VLU_HOME_URL

  afterEach(() => {
    process.env.VLU_HOME_URL = originalVluHomeUrl
  })

  it('accepts configured HTTPS VLU hosts', () => {
    process.env.VLU_HOME_URL = 'https://online.vlu.edu.vn/Home'

    expect(resolveVluBaseUrl().toString()).toBe('https://online.vlu.edu.vn/Home')
  })

  it.each([
    'http://online.vlu.edu.vn/Home',
    'https://localhost/Home',
    'https://127.0.0.1/Home',
    'https://10.0.0.1/Home',
    'https://192.168.1.10/Home',
    'https://172.16.0.1/Home',
    'https://169.254.169.254/latest/meta-data',
    'https://evil.test/Home',
    'https://user:pass@online.vlu.edu.vn/Home',
  ])('rejects unsafe VLU_HOME_URL %s', (url) => {
    process.env.VLU_HOME_URL = url

    expect(() => resolveVluBaseUrl()).toThrow(CalendarServiceError)
    try {
      resolveVluBaseUrl()
    } catch (error) {
      expect((error as CalendarServiceError).code).toBe(CalendarServiceErrorCode.VluUnavailable)
    }
  })
})

describe('fetchRawVluCalendar', () => {
  const originalVluHomeUrl = process.env.VLU_HOME_URL

  afterEach(() => {
    process.env.VLU_HOME_URL = originalVluHomeUrl
    jest.restoreAllMocks()
  })

  it('uses only configured VLU_HOME_URL as the upstream target', async () => {
    process.env.VLU_HOME_URL = 'https://online.vlu.edu.vn/Home'
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, text: async () => '<html />' }) as jest.Mock

    await fetchRawVluCalendar({ cookie: 'sid=secret', termId: 'HK01', yearStudy: '2025-2026', lichType: 'lichHoc' })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://online.vlu.edu.vn/Home/DrawingStudentSchedule_Perior?YearStudy=2025-2026&TermID=HK01',
      expect.objectContaining({ headers: { Cookie: 'sid=secret' } }),
    )
  })
})
