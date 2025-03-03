'use server'

import { convertTime } from '@/constants/calendar'
import { convertGTime, formatText, getExactDate, getMondayDate } from '@/lib/utils'
import { CalendarType } from '@/types/calendar'
import { JSDOM } from 'jsdom'

export async function formatRawCalendar(rawCalendar: string, yearStudy: string, lichType: string): Promise<CalendarType[] | null> {
  try {
    const dom = new JSDOM(formatText(rawCalendar))
    const document = dom.window.document

    const rows = document.querySelectorAll('tbody tr')

    const calendars: CalendarType[] = []

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td')
      if (cells.length <= 1) return

      if (lichType === 'lichThi') {
        const startDate = formatText(cells[5]?.textContent)
        const startTime = convertGTime(formatText(cells[6]?.textContent) as string)
        const endDate = formatText(cells[5]?.textContent)
        const endTime = convertGTime(formatText(cells[6]?.textContent) as string)
        const summary = formatText(cells[2]?.textContent)
        const location = formatText(cells[7]?.textContent)
        const description = formatText(cells[4]?.textContent) + ' - ' + formatText(cells[1]?.textContent) + ' - ' + formatText(cells[10]?.textContent)

        if (!startDate || !startTime || !endDate || !endTime || !summary || !location) return

        calendars.push({ summary, location, startDate, endDate, startTime, endTime, description })
        return
      } else if (lichType === 'lichHoc') {
        const weeks = cells[9]?.textContent?.split(',').map((week) => week.trim()) ?? []

        const learningTime = formatText(cells[6]?.textContent)
        const learningDate = formatText(cells[5]?.textContent)
        const summary = formatText(cells[2]?.textContent)
        const description = cells[7]?.textContent && cells[8]?.textContent ? formatText(cells[7].textContent + ' ' + cells[8].textContent) : null
        const location = formatText(cells[7]?.textContent)
        const teacher = formatText(cells[8]?.textContent)

        if (!weeks || !learningTime || !learningDate || !summary || !description || !location || !teacher) return

        weeks.forEach((week) => {
          const monday = getMondayDate(yearStudy, parseInt(week))[0]
          const exactDate = getExactDate(monday, learningDate)

          const startDate = exactDate
          const endDate = exactDate
          const convertedTime = convertTime[learningTime]
          const startTime = convertedTime[0]
          const endTime = convertedTime[1]

          if (!summary || !description || !location || !learningDate || !learningTime || !teacher) return

          calendars.push({ summary, description, location, startDate, endDate, startTime, endTime })
        })
      } else {
        throw new Error('Invalid lichType')
      }
    })
    return calendars
  } catch (error) {
    console.error(error)
    return null
  }
}
