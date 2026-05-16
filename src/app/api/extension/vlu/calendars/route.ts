import { extensionCalendarsRequestSchema } from '@/services/calendar-types'
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
  const guard = await guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = extensionCalendarsRequestSchema.parse(await readLimitedJson(request))
    const cookie = body.vlu.selectedCookieHeader
    const events: CalendarType[] = []
    const allWarnings: ParserWarning[] = []

    console.info('[VLU calendars] Request accepted', {
      requestId: guard.requestId,
      cookieCount: body.vlu.cookies.length,
      cookies: body.vlu.cookies.map((cookie) => ({
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        valueLength: cookie.value.length,
        valuePreview: cookie.value.length > 8 ? `${cookie.value.slice(0, 4)}...${cookie.value.slice(-4)}` : '[redacted]',
      })),
      selectedCookieHeader: body.vlu.selectedCookieHeader.replace(/=.*/, '=[REDACTED]'),
      selectedCookieHeaderLength: body.vlu.selectedCookieHeader.length,
      filters: body.filters,
      origin: request.headers.get('origin'),
      client: request.headers.get('x-calendarvlu-client'),
    })

    if (body.filters.types.includes('study')) {
      const rawStudy = await fetchRawVluCalendar({ cookie, termId: body.filters.termId, yearStudy: body.filters.yearStudy, lichType: 'lichHoc' })
      const result = parseVluCalendar(rawStudy, body.filters.yearStudy, 'lichHoc')
      events.push(...result.data)
      allWarnings.push(...result.warnings)
    }

    if (body.filters.types.includes('exam')) {
      const rawExam = await fetchRawVluCalendar({ cookie, termId: body.filters.termId, yearStudy: body.filters.yearStudy, lichType: 'lichThi' })
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
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.InvalidCookie) {
      return extensionError('BAD_REQUEST', 'Invalid VLU cookie format.', 400, guard.requestId, {}, request)
    }
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.CookieExpired) {
      console.warn('[VLU calendars] Cookie rejected by VLU', {
        requestId: guard.requestId,
      })
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
