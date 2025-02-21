import { getCalendar, saveCalendar } from '@/actions/calendar'
import { formatRawCalendar, getCurrentTermID, getCurrentYearStudy, LICH } from '@/lib/calendar'
import { vluHomeURL } from '@/lib/urls'
import { TableCalendarType } from '@/types/calendar'
import { Calendar } from '@prisma/client'
import { NextRequest } from 'next/server'

/**
 * Handles the GET request to get the calendar.
 *
 * @export
 * @param {NextRequest} req
 * @return {Promise<Response>} Response containing TableCalendarType[] data
 * @example
 * // Request URL: /api/calendar?id=yourId&cookie=yourCookie&termId=yourTermId&yearStudy=yourYearStudy&lichType=lichHoc
 * // Success response:
 *
 * // Failure response: { "error": "Failed when converting calendars" }, { status: 503 }
 * // Failure response: { "error": "Cookie Expired!" }, { status: 401 }
 */

export async function GET(req: NextRequest): Promise<Calendar[] | Response> {
  // eslint-disable-next-line prefer-const
  let { cookie, userId, termId, yearStudy, lichType } = Object.fromEntries(new URL(req.url).searchParams)

  if (!userId) return new Response('Missing userId', { status: 400 })

  // if undefined, get current termId and yearStudy
  termId = termId ?? getCurrentTermID()
  yearStudy = yearStudy ?? getCurrentYearStudy()
  const getLich = lichType == 'lichHoc' ? LICH.LichHoc : LICH.LichThi

  // cần check trong db xem đã lưu lịch chưa, nếu có thì trả về lịch đã lưu còn không thì fetch vlu để lấy lịch
  const getDbCalendar: Calendar | null = await getCalendar(userId, termId, yearStudy, lichType)

  // nếu lịch đã lưu thì trả về lịch
  if (getDbCalendar) return Response.json(getDbCalendar, { status: 200, headers: { 'Content-Type': 'application/json' } })

  // nếu chưa có lịch trong db, fetch vlu để lấy lịch
  // code 200 && status ok thì lấy được lịch
  const response = await fetch(`${vluHomeURL}/${getLich}?YearStudy=${yearStudy}&TermID=${termId}`, {
    method: 'GET',
    headers: { Cookie: cookie },
    redirect: 'manual',
  })

  if (response.status != 200 || !response.ok) return Response.json({ error: 'Cookie Expired!' }, { status: 401 })

  const formattedCalendar: TableCalendarType[] | null = formatRawCalendar(await response.text())

  if (!formattedCalendar) return Response.json({ error: 'Failed when converting calendars' }, { status: 503 })

  const savedCalendar: Calendar = await saveCalendar(userId, formattedCalendar, termId, yearStudy, lichType)

  return Response.json(savedCalendar, { status: 200, headers: { 'Content-Type': 'application/json' } })
}
