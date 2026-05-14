import { extensionCalendarsRequestSchema, formatCookieHeader } from '@/services/calendar-types'
import { extensionError, extensionJson, guardExtensionRequest, mapUnknownError, readLimitedJson } from '@/services/extension-api'
import { CalendarServiceError, CalendarServiceErrorCode } from '@/services/errors'
import { parseVluCalendar } from '@/services/calendar-parser'
import { fetchRawVluCalendar } from '@/services/vlu-client'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = extensionCalendarsRequestSchema.parse(await readLimitedJson(request))
    const cookie = formatCookieHeader(body.vlu.cookies)
    const events = []

    if (body.filters.types.includes('study')) {
      const rawStudy = await fetchRawVluCalendar({ cookie, termId: body.filters.termId, yearStudy: body.filters.yearStudy, lichType: 'lichHoc', baseUrl: body.vlu.baseUrl })
      events.push(...parseVluCalendar(rawStudy, body.filters.yearStudy, 'lichHoc'))
    }

    if (body.filters.types.includes('exam')) {
      const rawExam = await fetchRawVluCalendar({ cookie, termId: body.filters.termId, yearStudy: body.filters.yearStudy, lichType: 'lichThi', baseUrl: body.vlu.baseUrl })
      events.push(...parseVluCalendar(rawExam, body.filters.yearStudy, 'lichThi'))
    }

    return extensionJson({
      ok: true,
      events,
      warnings: [],
      diagnostics: { source: 'vlu', eventCount: events.length },
    })
  } catch (error) {
    if (error instanceof ZodError) return extensionError('BAD_REQUEST', 'Invalid calendars request.', 400, guard.requestId, { issues: error.issues })
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.CookieExpired) {
      return extensionError('COOKIE_EXPIRED', 'Your VLU session has expired. Sign in on the official VLU website and try again.', 401, guard.requestId)
    }
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.ParserFailed) {
      return extensionError('PARSER_FAILED', 'Calendar data could not be parsed.', 422, guard.requestId)
    }
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.VluUnavailable) {
      return extensionError('VLU_UNAVAILABLE', 'VLU is unavailable. Try again later.', 503, guard.requestId)
    }

    return mapUnknownError(error, guard.requestId)
  }
}
