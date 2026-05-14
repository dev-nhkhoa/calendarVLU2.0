import { formatRawCalendar } from '@/actions/calendar'
import { getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import { fetchRawVluCalendar } from '@/services/vlu-client'
import { recordFailure } from '@/services/audit-logger'
import { CalendarType } from '@/types/calendar'
import { NextRequest } from 'next/server'

/**
 * Handles the GET request to get the calendar.
 *
 * @deprecated Use the extension API at /api/extension/vlu/calendars instead.
 */

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams)
  const { cookie, lichType } = params
  const termId = params.termId ?? getCurrentTermID()
  const yearStudy = params.yearStudy ?? getCurrentYearStudy()

  if (!cookie) return Response.json({ error: 'Missing cookie' }, { status: 400 })

  if (!lichType) return Response.json({ error: 'Missing lichType' }, { status: 400 })
  if (lichType !== 'lichHoc' && lichType !== 'lichThi') return Response.json({ error: 'Invalid lichType' }, { status: 400 })

  let rawCalendar: string
  try {
    rawCalendar = await fetchRawVluCalendar({ cookie, termId, yearStudy, lichType })
  } catch {
    recordFailure('vlu_fetch', 'Cookie expired in legacy calendar endpoint')
    return Response.json({ error: 'Cookie Expired!' }, { status: 401 })
  }

  const formattedCalendar: CalendarType[] | null = await formatRawCalendar(rawCalendar, yearStudy, lichType)

  if (!formattedCalendar) {
    recordFailure('parser', 'Failed to parse calendar in legacy endpoint')
    return Response.json({ error: 'Failed when converting calendars' }, { status: 503 })
  }

  return Response.json(formattedCalendar, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      Deprecation: 'true',
      'X-Deprecation-Notice': 'Use /api/extension/vlu/calendars instead',
    },
  })
}
