import { getAccessToken } from '@/actions/google'
import { extensionError, extensionJson, guardExtensionRequest, mapUnknownError } from '@/services/extension-api'

interface GoogleCalendarListItem {
  id: string
  summary: string
  primary?: boolean
  accessRole?: string
  backgroundColor?: string
}

export async function GET(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return extensionError('GOOGLE_NOT_CONNECTED', 'Connect Google Calendar before listing calendars.', 401, guard.requestId)

    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (response.status === 401) return extensionError('GOOGLE_TOKEN_INVALID', 'Reconnect Google Calendar and try again.', 401, guard.requestId)
    if (response.status === 403) return extensionError('GOOGLE_PERMISSION_DENIED', 'Calendar permission is missing or denied.', 403, guard.requestId)
    if (!response.ok) return extensionError('INTERNAL_ERROR', 'Unable to fetch Google calendars.', 502, guard.requestId)

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

    return extensionJson({ ok: true, calendars })
  } catch (error) {
    return mapUnknownError(error, guard.requestId)
  }
}
