import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

describe('Integration: iCal Export Flow', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
  })

  describe('successful iCal export', () => {
    it('exports events to valid ICS format with VEVENT structure', async () => {
      const events = [
        {
          id: 'vlu-study-1',
          summary: 'Lập Trình Web',
          description: 'Môn học lập trình web với React và Node.js',
          location: 'A101 - Cơ sở 1',
          startDate: '08/09/2025',
          endDate: '10/09/2025',
          startTime: '07:00',
          endTime: '08:45',
        },
        {
          id: 'vlu-exam-1',
          summary: 'Kiểm Tra Cuối Kỳ - Lập Trình Web',
          description: 'Thi cuối kỳ môn lập trình web',
          location: 'Phòng 101',
          startDate: '20/12/2025',
          endDate: '20/12/2025',
          startTime: '09:00',
          endTime: '11:30',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'vlu-calendar-export.ics',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        filename: 'vlu-calendar-export.ics',
        ics: expect.stringContaining('BEGIN:VCALENDAR'),
      })

      const icsContent = result.ics

      // Verify VCALENDAR structure
      expect(icsContent).toContain('BEGIN:VCALENDAR')
      expect(icsContent).toContain('VERSION:2.0')
      expect(icsContent).toContain('PRODID:-//CalendarVLU//Calendar Export//EN')
      expect(icsContent).toContain('END:VCALENDAR')

      // Verify VEVENT count (should have 2 events)
      const veventMatches = icsContent.match(/BEGIN:VEVENT/g)
      expect(veventMatches).toHaveLength(2)

      // Verify first event structure
      expect(icsContent).toContain('SUMMARY:Lập Trình Web')
      expect(icsContent).toContain('DESCRIPTION:Môn học lập trình web với React và Node.js')
      expect(icsContent).toContain('LOCATION:A101 - Cơ sở 1')

      // Verify date/time format (should be in UTC)
      expect(icsContent).toMatch(/DTSTART:\d{8}T\d{6}Z/)
      expect(icsContent).toMatch(/DTEND:\d{8}T\d{6}Z/)

      // Verify exam event
      expect(icsContent).toContain('SUMMARY:Kiểm Tra Cuối Kỳ - Lập Trình Web')
      expect(icsContent).toContain('LOCATION:Phòng 101')
    })

    it('handles recurring events correctly', async () => {
      const events = [
        {
          id: 'recurring-study',
          summary: 'Môn Học Hàng Tuần',
          description: 'Lớp học hàng tuần',
          location: 'B202',
          startDate: '08/09/2025',
          endDate: '29/12/2025', // Multiple weeks
          startTime: '09:00',
          endTime: '10:45',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'recurring-events.ics',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      const icsContent = result.ics

      // Should create separate events for each occurrence
      const veventMatches = icsContent.match(/BEGIN:VEVENT/g)
      expect(veventMatches!.length).toBeGreaterThan(1)

      // Each event should have unique UID
      const uidMatches = icsContent.match(/UID:(.+)/g)
      const uids = uidMatches!.map(match => match.split(':')[1])
      expect(new Set(uids).size).toBe(uids.length)
    })
  })

  describe('ICS format validation', () => {
    it('generates RFC 5545 compliant ICS content', async () => {
      const events = [
        {
          id: 'rfc-compliance-test',
          summary: 'Test Event',
          description: 'Testing RFC 5545 compliance',
          location: 'Test Room',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'rfc-test.ics',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      const icsContent = result.ics

      // Required VCALENDAR properties
      expect(icsContent).toContain('VERSION:2.0')
      expect(icsContent).toContain('PRODID:')

      // Required VEVENT properties
      expect(icsContent).toContain('UID:')
      expect(icsContent).toContain('DTSTAMP:')
      expect(icsContent).toContain('DTSTART:')
      expect(icsContent).toContain('DTEND:')
      expect(icsContent).toContain('SUMMARY:')

      // Proper line folding (no lines >75 chars without folding)
      const lines = icsContent.split('\n')
      for (const line of lines) {
        if (line.length > 75) {
          expect(line.charAt(75)).toBe(' ')
        }
      }
    })

    it('handles special characters and encoding', async () => {
      const events = [
        {
          id: 'special-chars-test',
          summary: 'Event with Special Characters: àáảãạđèéẻẽẹêếềểễệ',
          description: 'Description with newlines\nand special chars: @#$%^&*()',
          location: 'Room with,commas and "quotes"',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'special-chars.ics',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      const icsContent = result.ics

      // Verify special characters are preserved
      expect(icsContent).toContain('àáảãạđèéẻẽẹêếềểễệ')
      expect(icsContent).toContain('@#$%^&*()')

      // Verify proper escaping of commas and semicolons
      expect(icsContent).toContain('Room with,commas and "quotes"')
    })
  })

  describe('empty events handling', () => {
    it('returns error when no events provided', async () => {
      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events: [],
            options: {
              filename: 'empty.ics',
            },
          }),
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error.code).toBe('NO_EVENTS')
    })
  })

  describe('security validation', () => {
    it('validates extension origin', async () => {
      const events = [
        {
          id: 'security-test',
          summary: 'Security Test',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
          method: 'POST',
          headers: {
            origin: 'https://unauthorized-origin.com',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'security-test.ics',
            },
          }),
        }),
      )

      expect(response.status).toBe(403)
      const result = await response.json()
      expect(result.error).toBe('Origin is not allowed')
    })

    it('validates content type', async () => {
      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-ical', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'text/plain', // Wrong content type
          },
          body: JSON.stringify({
            events: [],
            options: { filename: 'test.ics' },
          }),
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Content-Type must be application/json')
    })
  })
})