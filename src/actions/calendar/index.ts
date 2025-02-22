'use server'

import { prisma } from '@/lib/prisma'
import { TableCalendarType } from '@/types/calendar'
import { Calendar } from '@prisma/client'
import { JSDOM } from 'jsdom'

export async function formatRawCalendar(rawCalendar: string): Promise<TableCalendarType[] | null> {
  try {
    const dom = new JSDOM(rawCalendar.trim())
    const document = dom.window.document

    const rows = document.querySelectorAll('tbody tr')

    const calendars: TableCalendarType[] = []

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td')

      const weeks = cells[9]?.textContent?.split(',').map((week) => week.trim()) ?? []

      // TODO: xử lý để tìm các trường hợp không có tuần học, sẽ loại bỏ ra khỏi calendar
      calendars.push({
        summary: cells[2]?.textContent ?? '', // done
        description: cells[7]?.textContent + ' ' + cells[8]?.textContent,
        location: cells[7]?.textContent ?? '', // done
        learningDate: cells[5]?.textContent ?? '',
        learningTime: cells[6]?.textContent ?? '',
        teacher: cells[8]?.textContent ?? '', // done
        weeks: weeks ?? [],
      })
    })
    return calendars
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getCalendar(userId: string, termId: string, yearStudy: string, lichType: string): Promise<Calendar | null> {
  return await prisma.calendar.findFirst({ where: { user: { id: userId }, termId, yearStudy, lichType } })
}

export async function saveCalendar(userId: string, scheduleDetails: TableCalendarType[], termId: string, yearStudy: string, lichType: string): Promise<Calendar> {
  // check nếu đã có lịch học cùng kì cùng năm học thì update vì chưa có logic tự động update lịch mới. Tạm thời sẽ để như vậy.
  const calendar = await prisma.calendar.findFirst({ where: { user: { id: userId }, termId, yearStudy, lichType } })

  if (calendar) return updateCalendar(calendar.id, scheduleDetails)

  return await prisma.calendar.create({
    data: {
      user: { connect: { id: userId } },
      termId,
      yearStudy,
      lichType,
      details: scheduleDetails,
    },
  })
}

export async function updateCalendar(calendarId: string, scheduleDetails: TableCalendarType[]): Promise<Calendar> {
  return await prisma.calendar.update({
    where: { id: calendarId },
    data: { details: scheduleDetails },
  })
}

export async function deleteCalendars(userId: string) {
  return await prisma.calendar.deleteMany({ where: { userId } })
}
