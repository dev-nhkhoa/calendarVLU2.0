'use server'

import { prisma } from '@/lib/prisma'
import { Calendar } from '@prisma/client'

export async function saveCalendar(userId: string, scheduleDetail: string, termId: string, yearStudy: string, lichType: string): Promise<Calendar> {
  // check nếu đã có lịch học cùng kì cùng năm học thì update
  const calendar = await prisma.calendar.findFirst({ where: { user: { id: userId }, termId, yearStudy, lichType } })

  if (calendar) return updateCalendar(calendar.id, scheduleDetail)

  // lưu lịch mới vào db
  return await prisma.calendar.create({
    data: {
      user: { connect: { id: userId } },
      termId,
      yearStudy,
      lichType,
      details: scheduleDetail,
    },
  })
}

export async function updateCalendar(calendarId: string, details: string): Promise<Calendar> {
  return await prisma.calendar.update({
    where: { id: calendarId },
    data: { details },
  })
}

export async function getCalendar(userId: string, termId: string, yearStudy: string, lichType: string): Promise<Calendar | null> {
  return await prisma.calendar.findFirst({ where: { user: { id: userId }, termId, yearStudy, lichType } })
}
