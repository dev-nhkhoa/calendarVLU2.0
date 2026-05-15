import { extensionCalendarsRequestSchema, formatCookieHeader } from '@/services/calendar-types'
import { extensionError, extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError, readLimitedJson } from '@/services/extension-api'
import { CalendarServiceError, CalendarServiceErrorCode, ParserWarning } from '@/services/errors'
import { parseVluCalendar } from '@/services/calendar-parser'
import { fetchRawVluCalendar } from '@/services/vlu-client'
import { CalendarType } from '@/types/calendar'
import { ZodError } from 'zod'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function POST(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = extensionCalendarsRequestSchema.parse(await readLimitedJson(request))
    const cookie = formatCookieHeader(body.vlu.cookies)
    const events: CalendarType[] = []
    const allWarnings: ParserWarning[] = []

    if (body.filters.types.includes('study')) {
      const rawStudy = await fetchRawVluCalendar({ cookie, termId: body.filters.termId, yearStudy: body.filters.yearStudy, lichType: 'lichHoc', baseUrl: body.vlu.baseUrl })
      const result = parseVluCalendar(rawStudy, body.filters.yearStudy, 'lichHoc')
      events.push(...result.data)
      allWarnings.push(...result.warnings)
    }

    if (body.filters.types.includes('exam')) {
      const rawExam = await fetchRawVluCalendar({ cookie, termId: body.filters.termId, yearStudy: body.filters.yearStudy, lichType: 'lichThi', baseUrl: body.vlu.baseUrl })
      const result = parseVluCalendar(rawExam, body.filters.yearStudy, 'lichThi')
      events.push(...result.data)
      allWarnings.push(...result.warnings)
    }

    return extensionJson({
      ok: true,
      events,
      warnings: allWarnings,
      diagnostics: { source: 'vlu', eventCount: events.length },
    }, undefined, request)
  } catch (error) {
    if (error instanceof ZodError) return extensionError('BAD_REQUEST', 'Invalid calendars request.', 400, guard.requestId, { issues: error.issues }, request)
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.CookieExpired) {
      return extensionError('COOKIE_EXPIRED', 'Your VLU session has expired. Sign in on the official VLU website and try again.', 401, guard.requestId, {}, request)
    }
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.ParserFailed) {
      return extensionError('PARSER_FAILED', 'Calendar data could not be parsed.', 422, guard.requestId, {}, request)
    }
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.VluUnavailable) {
      return extensionError('VLU_UNAVAILABLE', 'VLU is unavailable. Try again later.', 503, guard.requestId, {}, request)
    }

    return mapUnknownError(error, guard.requestId, request)
  }
}
