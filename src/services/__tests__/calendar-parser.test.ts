import { parseVluCalendar, deduplicateEvents } from '../calendar-parser'
import { CalendarServiceError, ParserWarningCode } from '../errors'
import {
  emptySchedule,
  studyRowMissingFields,
  studyRowInvalidTimeSlot,
  examRowMissingDate,
  examRowMissingTime,
  examRowMissingSubject,
  multiWeekStudyWithLocationChange,
  studyWithNonConsecutiveWeeks,
  malformedHtml,
  extraWhitespaceFields,
  studyCalendarFull,
  examCalendarFull,
} from './fixtures/edge-cases'

function buildRow(cells: string[]) {
  return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
}

describe('S7-TC01: Parser parses study calendar sample into normalized events', () => {
  it('parses a study calendar row into normalized events with correct count', () => {
    const html = `<table><tbody>${buildRow(['', '', 'Lap Trinh Web', '', '', 'Hai', '1 - 2', 'A101', 'Nguyen Van A', '1, 2', ''])}</tbody></table>`
    const { data: events, warnings } = parseVluCalendar(html, '2025-2026', 'lichHoc')

    expect(events).toHaveLength(2)
    expect(warnings).toHaveLength(0)
    expect(events[0]).toMatchObject({
      source: 'vlu',
      type: 'study',
      summary: 'Lap Trinh Web',
      location: 'A101',
      startDate: '08/09/2025',
      endDate: '08/09/2025',
      startTime: '07:00:00',
      endTime: '08:40:00',
      timezone: 'Asia/Ho_Chi_Minh',
    })
    expect(events[1].startDate).toBe('15/09/2025')
  })

  it('parses the full study calendar fixture into correct number of events', () => {
    const { data: events, warnings } = parseVluCalendar(studyCalendarFull, '2025-2026', 'lichHoc')

    expect(events.length).toBeGreaterThan(0)
    events.forEach((event) => {
      expect(event.source).toBe('vlu')
      expect(event.type).toBe('study')
      expect(event.summary).toBeTruthy()
      expect(event.startDate).toBeTruthy()
      expect(event.startTime).toBeTruthy()
    })
    expect(warnings).toBeDefined()
  })
})

describe('S7-TC02: Parser parses exam calendar sample', () => {
  it('parses an exam calendar row with correct start time, end time, location, and subject', () => {
    const html = `<table><tbody>${buildRow(['', 'Ca 1', 'Toan Roi Rac', '', 'Thi tap trung', '20/12/2025', '7g30', 'B201', '', '', 'Ghi chu'])}</tbody></table>`
    const { data: events, warnings } = parseVluCalendar(html, '2025-2026', 'lichThi')

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      source: 'vlu',
      type: 'exam',
      summary: 'Toan Roi Rac',
      location: 'B201',
      startDate: '20/12/2025',
      endDate: '20/12/2025',
      startTime: '7:30:00',
      endTime: '08:30:00',
    })
    expect(warnings).toHaveLength(0)
  })

  it('parses the full exam calendar fixture correctly', () => {
    const { data: events } = parseVluCalendar(examCalendarFull, '2025-2026', 'lichThi')

    expect(events).toHaveLength(2)
    expect(events[0].summary).toBe('Toán Cao Cấp')
    expect(events[1].summary).toBe('Lập Trình Web')
  })
})

describe('S7-TC03: Parser handles events with missing optional fields', () => {
  it('skips exam row with missing date and returns empty result with warnings', () => {
    const { data, warnings } = parseVluCalendar(examRowMissingDate, '2025-2026', 'lichThi')
    expect(data).toHaveLength(0)
    expect(warnings).toHaveLength(2)
    expect(warnings[0].code).toBe(ParserWarningCode.RowSkipped)
    expect(warnings[1].code).toBe(ParserWarningCode.EmptyResult)
  })

  it('skips exam row with missing time and returns empty result with warnings', () => {
    const { data, warnings } = parseVluCalendar(examRowMissingTime, '2025-2026', 'lichThi')
    expect(data).toHaveLength(0)
    expect(warnings).toHaveLength(2)
    expect(warnings[0].code).toBe(ParserWarningCode.RowSkipped)
    expect(warnings[1].code).toBe(ParserWarningCode.EmptyResult)
  })

  it('skips exam row with missing subject and returns empty result with warnings', () => {
    const { data, warnings } = parseVluCalendar(examRowMissingSubject, '2025-2026', 'lichThi')
    expect(data).toHaveLength(0)
    expect(warnings).toHaveLength(2)
    expect(warnings[0].code).toBe(ParserWarningCode.RowSkipped)
    expect(warnings[1].code).toBe(ParserWarningCode.EmptyResult)
  })

  it('skips study row with missing time slot and returns empty result with warnings', () => {
    const { data, warnings } = parseVluCalendar(studyRowMissingFields, '2025-2026', 'lichHoc')
    expect(data).toHaveLength(0)
    expect(warnings).toHaveLength(1)
    expect(warnings[0].code).toBe(ParserWarningCode.EmptyResult)
  })

  it('throws when schedule is empty (too short to be valid HTML)', () => {
    expect(() => parseVluCalendar(emptySchedule, '2025-2026', 'lichHoc')).toThrow(CalendarServiceError)
  })

  it('returns empty result with warnings when all rows fail to parse', () => {
    const { data, warnings } = parseVluCalendar(studyRowInvalidTimeSlot, '2025-2026', 'lichHoc')
    expect(data).toHaveLength(0)
    expect(warnings).toHaveLength(2)
    expect(warnings[0].code).toBe(ParserWarningCode.InvalidTimeSlot)
    expect(warnings[1].code).toBe(ParserWarningCode.EmptyResult)
  })
})

describe('S7-TC04: Parser handles edge cases', () => {
  it('handles multi-week study calendars', () => {
    const { data: events } = parseVluCalendar(multiWeekStudyWithLocationChange, '2025-2026', 'lichHoc')
    expect(events).toHaveLength(2)
    expect(events[0].startDate).toBe('08/09/2025')
    expect(events[1].startDate).toBe('15/09/2025')
  })

  it('handles non-consecutive weeks', () => {
    const { data: events } = parseVluCalendar(studyWithNonConsecutiveWeeks, '2025-2026', 'lichHoc')
    expect(events).toHaveLength(5)
    expect(events[0].startDate).toBe('17/09/2025')
    expect(events[1].startDate).toBe('01/10/2025')
  })

  it('handles fields with extra whitespace', () => {
    const { data: events } = parseVluCalendar(extraWhitespaceFields, '2025-2026', 'lichHoc')
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].summary).toBe('Lập Trình Web')
  })

  it('throws on malformed HTML', () => {
    expect(() => parseVluCalendar(malformedHtml, '2025-2026', 'lichHoc')).toThrow(CalendarServiceError)
  })

  it('rejects invalid lichType', () => {
    expect(() => parseVluCalendar('<html></html>', '2025-2026', 'lichGiuaKy' as 'lichHoc')).toThrow(CalendarServiceError)
  })
})

describe('Deduplication', () => {
  it('deduplicates identical events by id', () => {
    const warnings: Array<Record<string, unknown>> = []
    const events = [
      {
        id: 'vlu_study_toan_08_09_2025_07_00_a101',
        source: 'vlu' as const,
        type: 'study' as const,
        summary: 'Toán',
        description: 'A101 Teacher',
        location: 'A101',
        startDate: '08/09/2025',
        endDate: '08/09/2025',
        startTime: '07:00:00',
        endTime: '08:40:00',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      {
        id: 'vlu_study_toan_08_09_2025_07_00_a101',
        source: 'vlu' as const,
        type: 'study' as const,
        summary: 'Toán',
        description: 'A101 Teacher',
        location: 'A101',
        startDate: '08/09/2025',
        endDate: '08/09/2025',
        startTime: '07:00:00',
        endTime: '08:40:00',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    ]
    const deduplicated = deduplicateEvents(events, warnings)
    expect(deduplicated).toHaveLength(1)
    expect(warnings).toHaveLength(1)
    expect(warnings[0].code).toBe(ParserWarningCode.RowSkipped)
  })

  it('keeps distinct events', () => {
    const warnings: Array<Record<string, unknown>> = []
    const events = [
      {
        id: 'event_1',
        source: 'vlu' as const,
        type: 'study' as const,
        summary: 'Toán',
        description: '',
        location: '',
        startDate: '08/09/2025',
        endDate: '08/09/2025',
        startTime: '07:00:00',
        endTime: '08:40:00',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      {
        id: 'event_2',
        source: 'vlu' as const,
        type: 'exam' as const,
        summary: 'Lý',
        description: '',
        location: '',
        startDate: '15/12/2025',
        endDate: '15/12/2025',
        startTime: '07:30:00',
        endTime: '08:30:00',
        timezone: 'Asia/Ho_Chi_Minh',
      },
    ]
    const deduplicated = deduplicateEvents(events, warnings)
    expect(deduplicated).toHaveLength(2)
    expect(warnings).toHaveLength(0)
  })
})
