import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

describe('POST /api/extension/calendar/export-ical', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
  })

  it('exports normalized events to an iCal payload', async () => {
    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
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
          options: { filename: 'calendar.ics' },
        }),
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      ok: true,
      filename: 'calendar.ics',
      contentType: 'text/calendar; charset=utf-8',
    })
    expect(body.ics).toContain('BEGIN:VCALENDAR')
    expect(body.ics).toContain('END:VCALENDAR')
    expect(body.ics).toContain('BEGIN:VEVENT')
    expect(body.ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20250908T070000')
  })

  it('returns 400 when events array is missing', async () => {
    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
        body: JSON.stringify({ options: { filename: 'calendar.ics' } }),
      }),
    )

    expect(response.status).toBe(400)
  })

  it('returns 400 when events has empty required fields', async () => {
    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
        method: 'POST',
        headers: { origin: 'https://calendarvlu.test' },
        body: JSON.stringify({
          events: [{ summary: '', description: '', location: '', startDate: '', endDate: '', startTime: '', endTime: '' }],
          options: { filename: 'calendar.ics' },
        }),
      }),
    )

    expect(response.status).toBe(400)
  })

  it('uses default filename when not provided', async () => {
    const response = await POST(
      new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
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
        }),
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.filename).toBe('vlu-calendar.ics')
  })

  it('rejects request from disallowed origin without extension header', async () => {
    const response = await POST(
      new Request('https://evil-site.test/api/extension/calendar/export-ical', {
        method: 'POST',
        headers: { origin: 'https://evil-site.test' },
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
          options: { filename: 'calendar.ics' },
        }),
      }),
    )

    expect(response.status).toBe(403)
  })
})
