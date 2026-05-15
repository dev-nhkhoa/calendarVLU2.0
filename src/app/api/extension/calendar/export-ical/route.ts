import { extensionIcalRequestSchema } from '@/services/calendar-types'
import { calendar2Ical } from '@/services/ical-export-service'
import { extensionError, extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError, readLimitedJson } from '@/services/extension-api'
import { ZodError } from 'zod'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function POST(request: Request) {
  const guard = await guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = extensionIcalRequestSchema.parse(await readLimitedJson(request))
    const ics = calendar2Ical(body.events)

    return extensionJson({
      ok: true,
      filename: body.options.filename,
      contentType: 'text/calendar; charset=utf-8',
      ics,
    }, undefined, request)
  } catch (error) {
    if (error instanceof ZodError) return extensionError('BAD_REQUEST', 'Invalid iCal export request.', 400, guard.requestId, { issues: error.issues }, request)
    return mapUnknownError(error, guard.requestId, request)
  }
}
