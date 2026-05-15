import { getOutlookAccessToken } from '@/actions/outlook'
import { extensionError, extensionJson, guardExtensionRequest, mapUnknownError } from '@/services/extension-api'

export async function GET(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const accessToken = await getOutlookAccessToken()
    if (!accessToken) return extensionError('OUTLOOK_NOT_CONNECTED', 'Connect Outlook Calendar before listing calendars.', 401, guard.requestId, {}, request)

    return extensionJson({ ok: true, calendars: [{ id: 'default', summary: 'Lịch của tôi', primary: true }] }, undefined, request)
  } catch (error) {
    return mapUnknownError(error, guard.requestId, request)
  }
}
