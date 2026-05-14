import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

describe('POST /api/extension/calendar/export-csv', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
  })

  it('exports normalized events to a CSV payload', async () => {
    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
        body: JSON.stringify({
          events: [
            {
              summary: 'Lap Trinh Web',
              description: 'A101 Nguyen Van A',
              location: 'A101',
              startDate: '08/09/2025',
              endDate: '08/09/2025',
              startTime: '07:00:00',
              endTime: '08:40:00',
            },
          ],
          options: { filename: 'calendar.csv' },
        }),
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      filename: 'calendar.csv',
      contentType: 'text/csv; charset=utf-8',
    })
  })
})
