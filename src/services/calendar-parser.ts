import { convertTime } from '@/constants/calendar'
import { convertGTime, formatText, getExactDate, getMondayDate, addMinutesToTime } from '@/lib/utils'
import { CalendarType } from '@/types/calendar'
import { JSDOM } from 'jsdom'
import { CalendarServiceError, CalendarServiceErrorCode, ParserWarning, ParserWarningCode, ParserResult } from './errors'

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
  const startTimeInput = formatText(cells[6]?.textContent)
  const startTime = startTimeInput ? convertGTime(startTimeInput) : undefined
  const endDate = startDate
  const DEFAULT_EXAM_MINUTES = 60
  const endTime = startTime ? addMinutesToTime(startTime, DEFAULT_EXAM_MINUTES) : startTime
  const summary = formatText(cells[2]?.textContent)
  const location = formatText(cells[7]?.textContent)
  const description = [formatText(cells[4]?.textContent), formatText(cells[1]?.textContent), formatText(cells[10]?.textContent)].filter(Boolean).join(' - ')

  if (!summary || !startDate || !startTime) return null

  return {
    id: buildEventId(['vlu', 'exam', summary, startDate, startTime, location || '']),
    source: 'vlu',
    type: 'exam',
    summary,
    location: location || '',
    startDate,
    endDate: endDate || startDate,
    startTime,
    endTime: endTime || startTime,
    description: description || summary,
    timezone: 'Asia/Ho_Chi_Minh',
  }
}

export function parseExamRowIntoCalendarType(cellsText: string[]): CalendarType | null {
  const get = (i: number) => cellsText[i]?.trim() || ''
  const startDate = get(5)
  const startTimeRaw = get(6)
  const startTime = startTimeRaw ? convertGTime(startTimeRaw) : ''
  const summary = get(2)
  const location = get(7)
  const description = [get(4), get(1), get(10)].filter(Boolean).join(' - ')

  if (!summary || !startDate || !startTime) return null

  const DEFAULT_EXAM_MINUTES = 60

  return {
    id: buildEventId(['vlu', 'exam', summary, startDate, startTime, location]),
    source: 'vlu',
    type: 'exam',
    summary,
    location: location || '',
    startDate,
    endDate: startDate,
    startTime,
    endTime: addMinutesToTime(startTime, DEFAULT_EXAM_MINUTES),
    description: description || summary,
    timezone: 'Asia/Ho_Chi_Minh',
  }
}

function parseStudyRows(
  cells: NodeListOf<HTMLTableCellElement>,
  yearStudy: string,
  rowIndex: number,
  warnings: ParserWarning[],
): CalendarType[] {
  const weeksRaw = formatText(cells[9]?.textContent)
  if (!weeksRaw) return []

  const weeks = weeksRaw.split(',').map((w) => w.trim()).filter(Boolean)
  const learningTime = formatText(cells[6]?.textContent)
  const learningDate = formatText(cells[5]?.textContent)
  const summary = formatText(cells[2]?.textContent)
  const location = formatText(cells[7]?.textContent)
  const teacher = formatText(cells[8]?.textContent)

  if (!summary) return []

  if (!learningTime) {
    warnings.push({ code: ParserWarningCode.MissingField, message: 'Missing learning time', field: 'learningTime', row: rowIndex })
    return []
  }

  if (!learningDate) {
    warnings.push({ code: ParserWarningCode.MissingField, message: 'Missing learning date (day of week)', field: 'learningDate', row: rowIndex })
    return []
  }

  const convertedTime = convertTime[learningTime]
  if (!convertedTime) {
    warnings.push({ code: ParserWarningCode.InvalidTimeSlot, message: `Unrecognized time slot: ${learningTime}`, field: 'learningTime', row: rowIndex, value: learningTime })
    return []
  }

  const description = [location, teacher].filter(Boolean).join(' ') || summary

  return weeks.flatMap((week) => {
    const weekNumber = Number.parseInt(week, 10)
    if (Number.isNaN(weekNumber)) {
      warnings.push({ code: ParserWarningCode.InvalidWeekNumber, message: `Invalid week number: ${week}`, field: 'week', row: rowIndex, value: week })
      return []
    }

    let monday: string
    try {
      monday = getMondayDate(yearStudy, weekNumber)[0]
    } catch {
      warnings.push({ code: ParserWarningCode.UnknownYearStudy, message: `Unknown year study: ${yearStudy}`, field: 'yearStudy', row: rowIndex, value: yearStudy })
      return []
    }

    let exactDate: string
    try {
      exactDate = getExactDate(monday, learningDate)
    } catch {
      warnings.push({ code: ParserWarningCode.InvalidDayOfWeek, message: `Invalid day of week: ${learningDate}`, field: 'learningDate', row: rowIndex, value: learningDate })
      return []
    }

    return [
      {
        id: buildEventId(['vlu', 'study', summary, exactDate, convertedTime[0], location || '']),
        source: 'vlu' as const,
        type: 'study' as const,
        summary,
        description,
        location: location || '',
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

/**
 * Deduplicate calendar events by their computed id.
 * When two events have the same id, keep the first and warn about the duplicate.
 */
export function deduplicateEvents(events: CalendarType[], warnings: ParserWarning[]): CalendarType[] {
  const seen = new Map<string, number>()
  return events.filter((event, index) => {
    const key = event.id || buildEventId(['vlu', event.type || 'unknown', event.summary, event.startDate, event.startTime, event.location])
    if (seen.has(key)) {
      warnings.push({
        code: ParserWarningCode.RowSkipped,
        message: `Duplicate event skipped: ${event.summary} on ${event.startDate}`,
        value: key,
        row: seen.get(key),
      })
      return false
    }
    seen.set(key, index)
    return true
  })
}

/**
 * Main parser pipeline:
 * 1. validate input
 * 2. parse HTML rows
 * 3. normalize to CalendarType[]
 * 4. deduplicate
 *
 * Returns a ParserResult with data and any warnings.
 */
export function parseVluCalendar(rawCalendar: string, yearStudy: string, lichType: VluCalendarType): ParserResult<CalendarType[]> {
  const warnings: ParserWarning[] = []

  if (lichType !== 'lichHoc' && lichType !== 'lichThi') {
    throw new CalendarServiceError(CalendarServiceErrorCode.InvalidCalendarType, 'Invalid VLU calendar type', 400)
  }

  if (!rawCalendar || rawCalendar.trim().length < 50) {
    throw new CalendarServiceError(CalendarServiceErrorCode.EmptyResponse, 'VLU response is empty or too short', 422)
  }

  let dom: JSDOM
  try {
    dom = new JSDOM(rawCalendar)
  } catch {
    throw new CalendarServiceError(CalendarServiceErrorCode.InvalidResponseFormat, 'Response could not be parsed as HTML', 422)
  }

  const rows = dom.window.document.querySelectorAll('tbody tr')
  if (rows.length === 0) {
    const allRows = dom.window.document.querySelectorAll('tr')
    if (allRows.length === 0) {
      throw new CalendarServiceError(CalendarServiceErrorCode.NoTableRows, 'No table rows found in VLU response', 422)
    }
  }

  const calendars: CalendarType[] = []

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td')
    if (cells.length <= 1) return

    if (lichType === 'lichThi') {
      const examEvent = parseExamRow(cells)
      if (examEvent) {
        calendars.push(examEvent)
      } else {
        warnings.push({
          code: ParserWarningCode.RowSkipped,
          message: 'Exam row skipped due to missing required fields',
          row: rowIndex,
        })
      }
      return
    }

    const studyEvents = parseStudyRows(cells, yearStudy, rowIndex, warnings)
    calendars.push(...studyEvents)
  })

  if (calendars.length === 0) {
    warnings.push({
      code: ParserWarningCode.EmptyResult,
      message: `No ${lichType === 'lichHoc' ? 'study' : 'exam'} events found for this term — the schedule may be empty.`,
    })
    return { data: [], warnings }
  }

  const deduplicated = deduplicateEvents(calendars, warnings)

  return { data: deduplicated, warnings }
}
