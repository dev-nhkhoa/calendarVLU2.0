import { formatEventDate, prepareCalendarEvents } from '../google-calendar-service'

describe('google-calendar-service', () => {
  it('formats VLU date and time for Google Calendar', () => {
    expect(formatEventDate('08/09/2025', '07:00:00')).toBe('2025-09-08T07:00:00+07:00')
  })

  it('maps normalized events to Google Calendar payloads', () => {
    const events = prepareCalendarEvents('primary', [
      {
        id: 'stable-event-id',
        summary: 'Lap Trinh Web',
        description: 'A101 Nguyen Van A',
        location: 'A101',
        startDate: '08/09/2025',
        endDate: '08/09/2025',
        startTime: '07:00:00',
        endTime: '08:40:00',
      },
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
        },
      },
    })
  })
})
