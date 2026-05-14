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
  id?: string
  source?: 'vlu'
  type?: 'study' | 'exam'
  summary: string
  description: string
  location: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timezone?: string
  term?: string
  metadata?: Record<string, unknown>
  private?: boolean | null
}

export type { TableCalendarType, CalendarType }
