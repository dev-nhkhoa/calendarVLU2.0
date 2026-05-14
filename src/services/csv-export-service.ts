import { CalendarType } from '@/types/calendar'
import { Parser } from 'json2csv'

export function calendar2Csv(calendars: CalendarType[]): string {
  const events = calendars.map((calendar) => ({
    Subject: calendar.summary,
    StartDate: calendar.startDate,
    StartTime: calendar.startTime,
    EndDate: calendar.endDate,
    EndTime: calendar.endTime,
    Location: calendar.location,
    Description: calendar.description,
  }))

  const parser = new Parser({
    fields: ['Subject', 'StartDate', 'StartTime', 'EndDate', 'EndTime', 'Location', 'Description'],
  })

  return parser.parse(events)
}
