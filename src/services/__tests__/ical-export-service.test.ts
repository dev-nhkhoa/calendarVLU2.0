import { calendar2Ical } from '../ical-export-service'

const sampleEvent = {
  summary: 'Lap Trinh Web',
  description: 'A101 - Nguyen Van A',
  location: 'A101',
  startDate: '08/09/2025',
  endDate: '08/09/2025',
  startTime: '07:00:00',
  endTime: '08:40:00',
}

describe('calendar2Ical', () => {
  it('returns string starting with BEGIN:VCALENDAR and ending with END:VCALENDAR', () => {
    const ics = calendar2Ical([sampleEvent])
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/)
    expect(ics).toMatch(/END:VCALENDAR\r\n$/)
  })

  it('includes VTIMEZONE block for Asia/Ho_Chi_Minh', () => {
    const ics = calendar2Ical([sampleEvent])
    expect(ics).toContain('BEGIN:VTIMEZONE')
    expect(ics).toContain('TZID:Asia/Ho_Chi_Minh')
    expect(ics).toContain('TZOFFSETFROM:+0700')
    expect(ics).toContain('TZOFFSETTO:+0700')
    expect(ics).toContain('TZNAME:ICT')
    expect(ics).toContain('END:VTIMEZONE')
  })

  it('formats date and time correctly in VEVENT', () => {
    const ics = calendar2Ical([sampleEvent])
    expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20250908T070000')
    expect(ics).toContain('DTEND;TZID=Asia/Ho_Chi_Minh:20250908T084000')
  })

  it('includes SUMMARY, LOCATION, DESCRIPTION in VEVENT', () => {
    const ics = calendar2Ical([sampleEvent])
    expect(ics).toContain('SUMMARY:Lap Trinh Web')
    expect(ics).toContain('LOCATION:A101')
    expect(ics).toContain('DESCRIPTION:A101 - Nguyen Van A')
  })

  it('generates deterministic output for same input', () => {
    const first = calendar2Ical([sampleEvent])
    const second = calendar2Ical([sampleEvent])
    expect(first).toBe(second)
  })

  it('contains UID in each VEVENT', () => {
    const ics = calendar2Ical([sampleEvent])
    expect(ics).toContain('UID:')
    expect(ics).toContain('@calendarvlu')
  })

  it('UID is lowercase and contains summary and dates', () => {
    const ics = calendar2Ical([sampleEvent])
    const uidMatch = ics.match(/UID:(.*?)@calendarvlu/)
    expect(uidMatch).not.toBeNull()
    if (uidMatch) {
      expect(uidMatch[1]).toBe('lap trinh web|08/09/2025|07:00:00|08:40:00|a101')
    }
  })

  it('returns empty calendar (no VEVENT) when given no events', () => {
    const ics = calendar2Ical([])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('includes multiple events when given multiple', () => {
    const event2 = {
      summary: 'Co So Du Lieu',
      description: 'B201 - Tran Van B',
      location: 'B201',
      startDate: '09/09/2025',
      endDate: '09/09/2025',
      startTime: '09:00:00',
      endTime: '10:40:00',
    }
    const ics = calendar2Ical([sampleEvent, event2])
    const veventMatches = ics.match(/BEGIN:VEVENT/g)
    expect(veventMatches).toHaveLength(2)
  })

  it('uses custom id as UID when provided', () => {
    const eventWithId = { ...sampleEvent, id: 'custom-id-123' }
    const ics = calendar2Ical([eventWithId])
    expect(ics).toContain('UID:custom-id-123@calendarvlu')
  })

  it('escapes special characters in text fields', () => {
    const eventWithSpecials = {
      ...sampleEvent,
      summary: 'Lập Trình Web; Nâng cao',
      location: 'Phòng A.101, Tòa nhà A',
      description: 'Giảng viên: Nguyễn Văn A\nGhi chú: quan trọng',
    }
    const ics = calendar2Ical([eventWithSpecials])
    expect(ics).toContain('SUMMARY:Lập Trình Web\\; Nâng cao')
    expect(ics).toContain('LOCATION:Phòng A.101\\, Tòa nhà A')
    expect(ics).toContain('DESCRIPTION:Giảng viên: Nguyễn Văn A\\nGhi chú: quan trọng')
  })

  it('includes VERSION, PRODID, CALSCALE, METHOD headers', () => {
    const ics = calendar2Ical([sampleEvent])
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//CalendarVLU//CalendarVLU//VI')
    expect(ics).toContain('CALSCALE:GREGORIAN')
    expect(ics).toContain('METHOD:PUBLISH')
  })

  it('handles single-character location correctly', () => {
    const eventMinimal = {
      summary: 'X',
      description: 'Y',
      location: 'Z',
      startDate: '01/01/2025',
      endDate: '01/01/2025',
      startTime: '00:00:00',
      endTime: '01:00:00',
    }
    const ics = calendar2Ical([eventMinimal])
    expect(ics).toContain('SUMMARY:X')
    expect(ics).toContain('LOCATION:Z')
  })

  it('has UID unique per unique event', () => {
    const eventA = { ...sampleEvent, summary: 'Event A' }
    const eventB = { ...sampleEvent, summary: 'Event B' }
    const ics = calendar2Ical([eventA, eventB])
    const uidA = ics.match(/UID:event a\|/)
    const uidB = ics.match(/UID:event b\|/)
    expect(uidA).toBeTruthy()
    expect(uidB).toBeTruthy()
  })
})
