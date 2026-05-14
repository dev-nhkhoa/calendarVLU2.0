import { formatRawCalendar } from '@/actions/calendar'
import { getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import { fetchRawVluCalendar } from '@/services/vlu-client'
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

  if (!cookie) return Response.json({ error: 'Missing cookie' }, { status: 400 })

  if (!lichType) return Response.json({ error: 'Missing lichType' }, { status: 400 })

  // if undefined, get current termId and yearStudy
  termId = termId ?? getCurrentTermID()
  yearStudy = yearStudy ?? getCurrentYearStudy()
  if (lichType !== 'lichHoc' && lichType !== 'lichThi') return Response.json({ error: 'Invalid lichType' }, { status: 400 })

  let rawCalendar: string
  try {
    rawCalendar = await fetchRawVluCalendar({ cookie, termId, yearStudy, lichType })
  } catch {
    return Response.json({ error: 'Cookie Expired!' }, { status: 401 })
  }

  const formattedCalendar: CalendarType[] | null = await formatRawCalendar(rawCalendar, yearStudy, lichType)

  if (!formattedCalendar) return Response.json({ error: 'Failed when converting calendars' }, { status: 503 })

  return Response.json(formattedCalendar, { status: 200, headers: { 'Content-Type': 'application/json' } })
}
