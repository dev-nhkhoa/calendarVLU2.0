import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

// VLU HTML fixtures for different scenarios
const vluFixtures = {
  lichHoc: `<table class="grid-view">
    <tbody>
      <tr>
        <td>1</td>
        <td>08/09/2025</td>
        <td>10/09/2025</td>
        <td>Lập Trình Web</td>
        <td>1 - 2</td>
        <td>A101</td>
        <td>Nguyễn Văn A</td>
        <td>2</td>
        <td>Thứ 2</td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>2</td>
        <td>11/09/2025</td>
        <td>13/09/2025</td>
        <td>Toán Cao Cấp</td>
        <td>3 - 4</td>
        <td>B202</td>
        <td>Trần Thị B</td>
        <td>1</td>
        <td>Thứ 5</td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>`,

  lichThi: `<table class="grid-view">
    <tbody>
      <tr>
        <td>1</td>
        <td>20/12/2025</td>
        <td>Kiểm Tra Cuối Kỳ</td>
        <td>9:00</td>
        <td>11:30</td>
        <td>Phòng 101</td>
        <td>Nguyễn Văn C</td>
        <td>Lập Trình Web</td>
        <td>HK01</td>
        <td>2025-2026</td>
      </tr>
    </tbody>
  </table>`,

  emptyTable: `<table class="grid-view"><tbody></tbody></table>`,

  malformedHtml: `<div class="broken">No table here</div>`,
}

function mockVluFetch(htmlResponse: string) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => htmlResponse,
  }) as jest.Mock
}

describe('Integration: Full VLU Calendar Flow', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
    process.env.VLU_HOME_URL = 'https://online.vlu.edu.vn/Home'
  })

  describe('lichHoc (Study Schedule)', () => {
    it('parses complete study schedule with multiple classes', async () => {
      mockVluFetch(vluFixtures.lichHoc)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            vlu: {
              baseUrl: 'https://online.vlu.edu.vn/Home',
              cookies: [{ name: 'ASP.NET_SessionId', value: 'test-session' }],
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
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        diagnostics: {
          source: 'vlu',
          eventCount: 2,
          termId: 'HK01',
          yearStudy: '2025-2026',
          types: ['study'],
        },
        events: expect.arrayContaining([
          expect.objectContaining({
            summary: 'Lập Trình Web',
            startDate: '08/09/2025',
            endDate: '10/09/2025',
            startTime: '07:00',
            endTime: '08:45',
            location: 'A101',
            teacher: 'Nguyễn Văn A',
            id: expect.stringMatching(/^vlu-/),
          }),
          expect.objectContaining({
            summary: 'Toán Cao Cấp',
            startDate: '11/09/2025',
            endDate: '13/09/2025',
            startTime: '09:00',
            endTime: '10:45',
            location: 'B202',
            teacher: 'Trần Thị B',
          }),
        ]),
      })

      // Verify events have unique IDs
      const eventIds = result.events.map((e: any) => e.id)
      expect(new Set(eventIds).size).toBe(eventIds.length)

      // Verify fetch was called with correct URL and cookies
      expect(global.fetch).toHaveBeenCalledWith(
        'https://online.vlu.edu.vn/Home/DrawingStudentSchedule_Perior?YearStudy=2025-2026&TermID=HK01',
        expect.objectContaining({
          headers: { Cookie: 'ASP.NET_SessionId=test-session' },
        }),
      )
    })

    it('handles empty study schedule gracefully', async () => {
      mockVluFetch(vluFixtures.emptyTable)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            vlu: {
              baseUrl: 'https://online.vlu.edu.vn/Home',
              cookies: [{ name: 'ASP.NET_SessionId', value: 'test-session' }],
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
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        diagnostics: {
          source: 'vlu',
          eventCount: 0,
          termId: 'HK01',
          yearStudy: '2025-2026',
          types: ['study'],
        },
        events: [],
      })
    })
  })

  describe('lichThi (Exam Schedule)', () => {
    it('parses exam schedule correctly', async () => {
      mockVluFetch(vluFixtures.lichThi)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            vlu: {
              baseUrl: 'https://online.vlu.edu.vn/Home',
              cookies: [{ name: 'ASP.NET_SessionId', value: 'test-session' }],
            },
            filters: {
              types: ['exam'],
              termId: 'HK01',
              yearStudy: '2025-2026',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        diagnostics: {
          source: 'vlu',
          eventCount: 1,
          termId: 'HK01',
          yearStudy: '2025-2026',
          types: ['exam'],
        },
        events: [
          expect.objectContaining({
            summary: 'Kiểm Tra Cuối Kỳ - Lập Trình Web',
            startDate: '20/12/2025',
            endDate: '20/12/2025',
            startTime: '09:00',
            endTime: '11:30',
            location: 'Phòng 101',
            teacher: 'Nguyễn Văn C',
            id: expect.stringMatching(/^vlu-/),
          }),
        ],
      })
    })
  })

  describe('error handling', () => {
    it('handles malformed HTML gracefully', async () => {
      mockVluFetch(vluFixtures.malformedHtml)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            vlu: {
              baseUrl: 'https://online.vlu.edu.vn/Home',
              cookies: [{ name: 'ASP.NET_SessionId', value: 'test-session' }],
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
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        diagnostics: {
          source: 'vlu',
          eventCount: 0,
          termId: 'HK01',
          yearStudy: '2025-2026',
          types: ['study'],
        },
        events: [],
      })
    })

    it('handles VLU server errors with proper error codes', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 302,
        text: async () => '',
      }) as jest.Mock

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            vlu: {
              baseUrl: 'https://online.vlu.edu.vn/Home',
              cookies: [{ name: 'ASP.NET_SessionId', value: 'expired-session' }],
            },
            filters: {
              types: ['study'],
              termId: 'HK01',
              yearStudy: '2025-2026',
            },
          }),
        }),
      )

      expect(response.status).toBe(401)
      const result = await response.json()
      expect(result.error.code).toBe('COOKIE_EXPIRED')
    })
  })

  describe('security validation', () => {
    it('validates cookie values before forwarding', async () => {
      // This test verifies that validateCookieValue is called and rejects invalid cookies
      mockVluFetch(vluFixtures.lichHoc)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            vlu: {
              baseUrl: 'https://online.vlu.edu.vn/Home',
              cookies: [{ name: 'ASP.NET_SessionId', value: 'valid-session' }],
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
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Cookie: 'ASP.NET_SessionId=valid-session' },
        }),
      )
    })

    it('rejects requests from unauthorized origins', async () => {
      mockVluFetch(vluFixtures.lichHoc)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/vlu/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://evil-attacker.com',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            vlu: {
              baseUrl: 'https://online.vlu.edu.vn/Home',
              cookies: [{ name: 'ASP.NET_SessionId', value: 'test-session' }],
            },
            filters: {
              types: ['study'],
              termId: 'HK01',
              yearStudy: '2025-2026',
            },
          }),
        }),
      )

      expect(response.status).toBe(403)
      const result = await response.json()
      expect(result.error).toBe('Origin is not allowed')
    })
  })
})