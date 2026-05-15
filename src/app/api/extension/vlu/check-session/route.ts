import { fetchRawVluCalendar } from '@/services/vlu-client'
import { checkSessionRequestSchema, formatCookieHeader } from '@/services/calendar-types'
import { extensionError, extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError, readLimitedJson } from '@/services/extension-api'
import { getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import { CalendarServiceError, CalendarServiceErrorCode } from '@/services/errors'
import { ZodError } from 'zod'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function POST(request: Request) {
  const guard = await guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = checkSessionRequestSchema.parse(await readLimitedJson(request))
    const cookie = formatCookieHeader(body.vlu.cookies)

    await fetchRawVluCalendar({
      cookie,
      termId: getCurrentTermID(),
      yearStudy: getCurrentYearStudy(),
      lichType: 'lichHoc',
    })

    return extensionJson({ ok: true, authenticated: true, student: null, warnings: [] }, undefined, request)
  } catch (error) {
    if (error instanceof ZodError) return extensionError('BAD_REQUEST', 'Invalid check-session request.', 400, guard.requestId, { issues: error.issues }, request)
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.CookieExpired) {
      return extensionError('COOKIE_EXPIRED', 'Your VLU session has expired. Sign in on the official VLU website and try again.', 401, guard.requestId, {}, request)
    }
    if (error instanceof CalendarServiceError && error.code === CalendarServiceErrorCode.VluUnavailable) {
      return extensionError('VLU_UNAVAILABLE', 'VLU is unavailable. Try again later.', 503, guard.requestId, {}, request)
    }

    return mapUnknownError(error, guard.requestId, request)
  }
}
