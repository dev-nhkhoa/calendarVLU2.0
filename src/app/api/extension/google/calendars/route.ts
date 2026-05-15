import { getAccessToken } from '@/actions/google'
import { extensionError, extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError } from '@/services/extension-api'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

interface GoogleCalendarListItem {
  id: string
  summary: string
  primary?: boolean
  accessRole?: string
  backgroundColor?: string
}

export async function GET(request: Request) {
  const guard = await guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return extensionError('GOOGLE_NOT_CONNECTED', 'Reconnect Google Calendar before listing calendars.', 401, guard.requestId, {}, request)

    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (response.status === 401) return extensionError('GOOGLE_TOKEN_INVALID', 'Reconnect Google Calendar and try again.', 401, guard.requestId, {}, request)
    if (response.status === 403) return extensionError('GOOGLE_PERMISSION_DENIED', 'Calendar permission is missing or denied.', 403, guard.requestId, {}, request)
    if (!response.ok) return extensionError('INTERNAL_ERROR', 'Unable to fetch Google calendars.', 502, guard.requestId, {}, request)

    const payload = (await response.json()) as { items?: GoogleCalendarListItem[] }
    const calendars = (payload.items ?? [])
      .filter((calendar) => ['owner', 'writer'].includes(calendar.accessRole ?? ''))
      .map((calendar) => ({
        id: calendar.id,
        summary: calendar.summary,
        primary: Boolean(calendar.primary),
        accessRole: calendar.accessRole,
        backgroundColor: calendar.backgroundColor,
      }))

    return extensionJson({ ok: true, calendars }, undefined, request)
  } catch (error) {
    return mapUnknownError(error, guard.requestId, request)
  }
}
