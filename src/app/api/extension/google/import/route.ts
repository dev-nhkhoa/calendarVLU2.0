import { getAccessToken } from '@/actions/google'
import { extensionGoogleImportRequestSchema } from '@/services/calendar-types'
import { extensionError, extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError, readLimitedJson } from '@/services/extension-api'
import { importGoogleCalendarEvents } from '@/services/google-calendar-service'
import { ZodError } from 'zod'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function POST(request: Request) {
  const guard = await guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = extensionGoogleImportRequestSchema.parse(await readLimitedJson(request, 256 * 1024))
    const accessToken = await getAccessToken()

    if (!accessToken) return extensionError('GOOGLE_NOT_CONNECTED', 'Reconnect Google Calendar before importing events.', 401, guard.requestId, {}, request)

    const report = await importGoogleCalendarEvents({
      accessToken,
      calendarId: body.calendarId,
      events: body.events,
      dryRun: body.options.dryRun,
    })

    return extensionJson({ ok: true, report }, { status: report.failed ? 207 : 200 }, request)
  } catch (error) {
    if (error instanceof ZodError) return extensionError('BAD_REQUEST', 'Invalid Google import request.', 400, guard.requestId, { issues: error.issues }, request)
    return mapUnknownError(error, guard.requestId, request)
  }
}
