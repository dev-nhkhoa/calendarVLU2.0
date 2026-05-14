'use server'

import { parseVluCalendar } from '@/services/calendar-parser'
import { CalendarType } from '@/types/calendar'

export async function formatRawCalendar(rawCalendar: string, yearStudy: string, lichType: string): Promise<CalendarType[] | null> {
  try {
    if (lichType !== 'lichHoc' && lichType !== 'lichThi') return null
    return parseVluCalendar(rawCalendar, yearStudy, lichType)
  } catch (error) {
    console.error(error)
    return null
  }
}
