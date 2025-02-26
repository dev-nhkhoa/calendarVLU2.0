interface TableCalendarType {
  summary: string | null
  description: string | null
  location: string | null
  learningDate: string | null
  learningTime: string | null
  teacher: string | null
  weeks: string[]
}

interface CalendarType {
  summary: string
  description: string
  location: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  private?: boolean | null
}

export type { TableCalendarType, CalendarType }
