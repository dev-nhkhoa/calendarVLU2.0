import { CalendarType } from '@/types/calendar'
import { Parser } from 'json2csv'

export enum TermID {
  HK01 = 'HK01',
  HK02 = 'HK02',
  HK03 = 'HK03',
}

export enum LICH {
  LichHoc = 'DrawingStudentSchedule_Perior',
  LichThi = 'ShowExam',
}

export function getCurrentTermID(): TermID {
  const currentMonth = new Date().getMonth()
  if (currentMonth < 6) return TermID.HK02
  if (currentMonth < 9) return TermID.HK03
  return TermID.HK01
}

export function getCurrentYearStudy(currentYear = new Date().getFullYear()): string {
  return `${currentYear - 1}-${currentYear}`
}

export function calendar2Csv(calendars: CalendarType[]): string {
  // Chuyển đổi sang CSV
  const events: unknown[] = []

  calendars.forEach((calendar) => {
    const { startDate, endDate, startTime, endTime, summary, description, location } = calendar
    events.push({
      Subject: summary,
      StartDate: startDate,
      StartTime: startTime,
      EndDate: endDate,
      EndTime: endTime,
      Location: location,
      Description: description,
    })
  })
  const parser = new Parser({
    fields: ['Subject', 'StartDate', 'StartTime', 'EndDate', 'EndTime', 'Location', 'Description'],
  })

  return parser.parse(events)
}
