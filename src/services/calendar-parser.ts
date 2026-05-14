import { convertTime } from '@/constants/calendar'
import { convertGTime, formatText, getExactDate, getMondayDate } from '@/lib/utils'
import { CalendarType } from '@/types/calendar'
import { JSDOM } from 'jsdom'
import { CalendarServiceError, CalendarServiceErrorCode } from './errors'

export type VluCalendarType = 'lichHoc' | 'lichThi'

function buildEventId(parts: Array<string | undefined>) {
  return parts
    .filter(Boolean)
    .join('_')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function parseExamRow(cells: NodeListOf<HTMLTableCellElement>): CalendarType | null {
  const startDate = formatText(cells[5]?.textContent)
  const startTime = convertGTime(formatText(cells[6]?.textContent) ?? '')
  const endDate = startDate
  const endTime = startTime
  const summary = formatText(cells[2]?.textContent)
  const location = formatText(cells[7]?.textContent)
  const description = [formatText(cells[4]?.textContent), formatText(cells[1]?.textContent), formatText(cells[10]?.textContent)].filter(Boolean).join(' - ')

  if (!startDate || !startTime || !endDate || !endTime || !summary || !location || !description) return null

  return {
    id: buildEventId(['vlu', 'exam', summary, startDate, startTime, location]),
    source: 'vlu',
    type: 'exam',
    summary,
    location,
    startDate,
    endDate,
    startTime,
    endTime,
    description,
    timezone: 'Asia/Ho_Chi_Minh',
  }
}

function parseStudyRows(cells: NodeListOf<HTMLTableCellElement>, yearStudy: string): CalendarType[] {
  const weeks = cells[9]?.textContent?.split(',').map((week) => week.trim()).filter(Boolean) ?? []
  const learningTime = formatText(cells[6]?.textContent)
  const learningDate = formatText(cells[5]?.textContent)
  const summary = formatText(cells[2]?.textContent)
  const location = formatText(cells[7]?.textContent)
  const teacher = formatText(cells[8]?.textContent)
  const description = location && teacher ? `${location} ${teacher}` : undefined

  if (!weeks.length || !learningTime || !learningDate || !summary || !description || !location || !teacher) return []

  const convertedTime = convertTime[learningTime]
  if (!convertedTime) return []

  return weeks.flatMap((week) => {
    const weekNumber = Number.parseInt(week, 10)
    if (Number.isNaN(weekNumber)) return []

    const monday = getMondayDate(yearStudy, weekNumber)[0]
    const exactDate = getExactDate(monday, learningDate)

    return [
      {
        id: buildEventId(['vlu', 'study', summary, exactDate, convertedTime[0], location]),
        source: 'vlu' as const,
        type: 'study' as const,
        summary,
        description,
        location,
        startDate: exactDate,
        endDate: exactDate,
        startTime: convertedTime[0],
        endTime: convertedTime[1],
        timezone: 'Asia/Ho_Chi_Minh',
        metadata: { teacher, week: weekNumber, learningTime, learningDate },
      },
    ]
  })
}

export function parseVluCalendar(rawCalendar: string, yearStudy: string, lichType: VluCalendarType): CalendarType[] {
  if (lichType !== 'lichHoc' && lichType !== 'lichThi') {
    throw new CalendarServiceError(CalendarServiceErrorCode.InvalidCalendarType, 'Invalid VLU calendar type', 400)
  }

  try {
    const dom = new JSDOM(formatText(rawCalendar))
    const rows = dom.window.document.querySelectorAll('tbody tr')
    const calendars: CalendarType[] = []

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td')
      if (cells.length <= 1) return

      if (lichType === 'lichThi') {
        const examEvent = parseExamRow(cells)
        if (examEvent) calendars.push(examEvent)
        return
      }

      calendars.push(...parseStudyRows(cells, yearStudy))
    })

    return calendars
  } catch (error) {
    if (error instanceof CalendarServiceError) throw error
    throw new CalendarServiceError(CalendarServiceErrorCode.ParserFailed, 'Failed to parse VLU calendar data', 422)
  }
}
