'use server'

import { prisma } from '@/lib/prisma'
import { TableCalendarType } from '@/types/calendar'
import { Calendar } from '@prisma/client'

export async function saveCalendar(userId: string, scheduleDetails: TableCalendarType[], termId: string, yearStudy: string, lichType: string): Promise<Calendar> {
  // check nếu đã có lịch học cùng kì cùng năm học thì update
  const calendar = await prisma.calendar.findFirst({ where: { user: { id: userId }, termId, yearStudy, lichType } })

  if (calendar) return updateCalendar(calendar.id, scheduleDetails)

  // lưu lịch mới vào db
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

export async function getCalendar(userId: string, termId: string, yearStudy: string, lichType: string): Promise<Calendar | null> {
  return await prisma.calendar.findFirst({ where: { user: { id: userId }, termId, yearStudy, lichType } })
}

export async function deleteCalendars(userId: string) {
  return await prisma.calendar.deleteMany({ where: { userId } })
}
