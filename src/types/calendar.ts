interface TableCalendarType {
  summary: string
  description: string
  location: string
  learningDate: string
  learningTime: string
  teacher: string
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
  private: boolean | null
}

export type { TableCalendarType, CalendarType }
