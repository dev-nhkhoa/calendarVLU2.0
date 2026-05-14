import { getAccessToken } from '@/actions/google'
import { extensionGoogleImportRequestSchema } from '@/services/calendar-types'
import { extensionError, extensionJson, guardExtensionRequest, mapUnknownError, readLimitedJson } from '@/services/extension-api'
import { importGoogleCalendarEvents } from '@/services/google-calendar-service'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = extensionGoogleImportRequestSchema.parse(await readLimitedJson(request, 256 * 1024))
    const accessToken = await getAccessToken()

    if (!accessToken) return extensionError('GOOGLE_NOT_CONNECTED', 'Connect Google Calendar before importing events.', 401, guard.requestId)

    const report = await importGoogleCalendarEvents({
      accessToken,
      calendarId: body.calendarId,
      events: body.events,
      dryRun: body.options.dryRun,
    })

    return extensionJson({ ok: true, report }, { status: report.failed ? 207 : 200 })
  } catch (error) {
    if (error instanceof ZodError) return extensionError('BAD_REQUEST', 'Invalid Google import request.', 400, guard.requestId, { issues: error.issues })
    return mapUnknownError(error, guard.requestId)
  }
}
