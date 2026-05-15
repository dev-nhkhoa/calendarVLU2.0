import { getOutlookAccessToken } from '@/actions/outlook'
import { extensionOutlookImportRequestSchema } from '@/services/calendar-types'
import { extensionError, extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError, readLimitedJson } from '@/services/extension-api'
import { importOutlookCalendarEvents } from '@/services/outlook-calendar-service'
import { ZodError } from 'zod'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function POST(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = extensionOutlookImportRequestSchema.parse(await readLimitedJson(request, 256 * 1024))
    const accessToken = await getOutlookAccessToken()

    if (!accessToken) return extensionError('OUTLOOK_NOT_CONNECTED', 'Connect Outlook Calendar before importing events.', 401, guard.requestId, {}, request)

    const report = await importOutlookCalendarEvents({
      accessToken,
      events: body.events,
      dryRun: body.options.dryRun,
    })

    return extensionJson({ ok: true, report }, { status: report.failed ? 207 : 200 }, request)
  } catch (error) {
    if (error instanceof ZodError) return extensionError('BAD_REQUEST', 'Invalid Outlook import request.', 400, guard.requestId, { issues: error.issues }, request)
    return mapUnknownError(error, guard.requestId, request)
  }
}
