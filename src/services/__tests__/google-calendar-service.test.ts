import { formatEventDate, importGoogleCalendarEvents, prepareCalendarEvents } from '../google-calendar-service'

const calendarEvent = {
  id: 'stable-event-id',
  summary: 'Lap Trinh Web',
  description: 'A101 Nguyen Van A',
  location: 'A101',
  startDate: '08/09/2025',
  endDate: '08/09/2025',
  startTime: '07:00:00',
  endTime: '08:40:00',
}

describe('google-calendar-service', () => {
  it('formats VLU date and time for Google Calendar', () => {
    expect(formatEventDate('08/09/2025', '07:00:00')).toBe('2025-09-08T07:00:00+07:00')
  })

  it('maps normalized events to Google Calendar payloads', () => {
    const events = prepareCalendarEvents('primary', [
      calendarEvent,
    ])

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      calendarId: 'primary',
      summary: 'Lap Trinh Web',
      start: {
        dateTime: '2025-09-08T07:00:00+07:00',
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: '2025-09-08T08:40:00+07:00',
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      extendedProperties: {
        private: {
          source: 'vlu',
          stableEventId: 'stable-event-id',
          payloadHash: expect.any(String),
        },
      },
    })
  })

  it('creates new Google events when no stable event exists', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'google-event-id' }) }) as jest.Mock

    const report = await importGoogleCalendarEvents({ accessToken: 'token', calendarId: 'primary', events: [calendarEvent] })

    expect(report).toMatchObject({ created: 1, updated: 0, skipped: 0, failed: 0 })
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://www.googleapis.com/calendar/v3/calendars/primary/events', expect.objectContaining({ method: 'POST' }))
  })

  it('skips existing Google events when payload hash matches', async () => {
    const prepared = prepareCalendarEvents('primary', [calendarEvent])[0]
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'google-event-id',
            extendedProperties: { private: { stableEventId: 'stable-event-id', payloadHash: prepared.extendedProperties.private.payloadHash } },
          },
        ],
      }),
    }) as jest.Mock

    const report = await importGoogleCalendarEvents({ accessToken: 'token', calendarId: 'primary', events: [calendarEvent] })

    expect(report).toMatchObject({ created: 0, updated: 0, skipped: 1, failed: 0 })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('updates existing Google events when payload hash changed', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{ id: 'google-event-id', extendedProperties: { private: { stableEventId: 'stable-event-id', payloadHash: 'old-hash' } } }],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'google-event-id' }) }) as jest.Mock

    const report = await importGoogleCalendarEvents({ accessToken: 'token', calendarId: 'primary', events: [calendarEvent] })

    expect(report).toMatchObject({ created: 0, updated: 1, skipped: 0, failed: 0 })
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://www.googleapis.com/calendar/v3/calendars/primary/events/google-event-id', expect.objectContaining({ method: 'PATCH' }))
  })
})
