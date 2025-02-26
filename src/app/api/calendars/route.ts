import { formatRawCalendar } from '@/actions/calendar'
import { getCurrentTermID, getCurrentYearStudy, LICH } from '@/lib/calendar'
import { CalendarType } from '@/types/calendar'
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

export async function GET(req: NextRequest) {
  // eslint-disable-next-line prefer-const
  let { cookie, termId, yearStudy, lichType } = Object.fromEntries(new URL(req.url).searchParams)

  // if undefined, get current termId and yearStudy
  termId = termId ?? getCurrentTermID()
  yearStudy = yearStudy ?? getCurrentYearStudy()
  const getLich = lichType == 'lichHoc' ? LICH.LichHoc : LICH.LichThi

  const response = await fetch(`${process.env.VLU_HOME_URL}/${getLich}?YearStudy=${yearStudy}&TermID=${termId}`, {
    method: 'GET',
    headers: { Cookie: cookie },
    redirect: 'manual',
  })

  if (response.status != 200 || !response.ok) return Response.json({ error: 'Cookie Expired!' }, { status: 401 })

  const formattedCalendar: CalendarType[] | null = await formatRawCalendar(await response.text(), yearStudy, lichType)

  if (!formattedCalendar) return Response.json({ error: 'Failed when converting calendars' }, { status: 503 })

  return Response.json(formattedCalendar, { status: 200, headers: { 'Content-Type': 'application/json' } })
}
