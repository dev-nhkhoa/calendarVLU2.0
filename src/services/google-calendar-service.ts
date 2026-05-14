import { CalendarType } from '@/types/calendar'

export interface GoogleCalendarEventInput {
  calendarId: string
  summary: string
  location: string
  description: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  extendedProperties: {
    private: {
      source: 'vlu'
      stableEventId: string
      payloadHash: string
    }
  }
}

export interface GoogleImportReport {
  created: number
  updated: number
  skipped: number
  failed: number
  failures: Array<{ stableEventId: string; error: string }>
}

export function formatEventDate(dateStr: string, timeStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number)
  if (!day || !month || !year || !timeStr) throw new Error('Invalid calendar date or time')

  const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  return `${isoDate}T${timeStr}+07:00`
}

export function getStableEventId(item: CalendarType) {
  if (item.id) return item.id

  return [item.summary, item.startDate, item.startTime, item.endTime, item.location]
    .filter(Boolean)
    .join('|')
    .toLowerCase()
}

export function getEventPayloadHash(input: Omit<GoogleCalendarEventInput, 'extendedProperties'>) {
  const payload = JSON.stringify({
    summary: input.summary,
    location: input.location,
    description: input.description,
    start: input.start,
    end: input.end,
  })

  let hash = 0
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash).toString(36)
}

export function prepareCalendarEvents(calendarId: string, calendarData: CalendarType[]): GoogleCalendarEventInput[] {
  return calendarData.flatMap((item) => {
    try {
      const stableEventId = getStableEventId(item)

      const googleEvent = {
        calendarId,
        summary: item.summary || 'Không có tiêu đề',
        location: item.location || 'Chưa xác định',
        description: item.description || 'Không có mô tả',
        start: {
          dateTime: formatEventDate(item.startDate, item.startTime),
          timeZone: item.timezone ?? 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: formatEventDate(item.endDate || item.startDate, item.endTime),
          timeZone: item.timezone ?? 'Asia/Ho_Chi_Minh',
        },
      }

      return [
        {
          ...googleEvent,
          extendedProperties: {
            private: {
              source: 'vlu' as const,
              stableEventId,
              payloadHash: getEventPayloadHash(googleEvent),
            },
          },
        },
      ]
    } catch {
      return []
    }
  })
}

interface GoogleCalendarApiEvent {
  id: string
  extendedProperties?: {
    private?: {
      stableEventId?: string
      payloadHash?: string
    }
  }
}

function toGoogleEventBody(event: GoogleCalendarEventInput) {
  return {
    summary: event.summary,
    location: event.location,
    description: event.description,
    start: event.start,
    end: event.end,
    extendedProperties: event.extendedProperties,
  }
}

async function findExistingGoogleEvent(input: { accessToken: string; calendarId: string; stableEventId: string }) {
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events`)
  url.searchParams.set('privateExtendedProperty', `stableEventId=${input.stableEventId}`)
  url.searchParams.set('showDeleted', 'false')
  url.searchParams.set('maxResults', '1')

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${input.accessToken}` },
  })

  if (!response.ok) throw new Error((await response.text()) || `Google Calendar search returned ${response.status}`)

  const payload = (await response.json()) as { items?: GoogleCalendarApiEvent[] }
  return payload.items?.[0]
}

export async function importGoogleCalendarEvents(input: { accessToken: string; calendarId: string; events: CalendarType[]; dryRun?: boolean }): Promise<GoogleImportReport> {
  const googleEvents = prepareCalendarEvents(input.calendarId, input.events)
  const report: GoogleImportReport = {
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  }

  if (input.dryRun) {
    report.skipped = googleEvents.length
    return report
  }

  for (const event of googleEvents) {
    const stableEventId = event.extendedProperties.private.stableEventId

    try {
      const existingEvent = await findExistingGoogleEvent({ accessToken: input.accessToken, calendarId: input.calendarId, stableEventId })
      const existingPayloadHash = existingEvent?.extendedProperties?.private?.payloadHash
      const nextPayloadHash = event.extendedProperties.private.payloadHash

      if (existingEvent && existingPayloadHash === nextPayloadHash) {
        report.skipped += 1
        continue
      }

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events${existingEvent ? `/${encodeURIComponent(existingEvent.id)}` : ''}`, {
        method: existingEvent ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toGoogleEventBody(event)),
      })

      if (!response.ok) {
        const errorText = await response.text()
        report.failed += 1
        report.failures.push({ stableEventId, error: errorText || `Google Calendar returned ${response.status}` })
        continue
      }

      if (existingEvent) {
        report.updated += 1
      } else {
        report.created += 1
      }
    } catch (error) {
      report.failed += 1
      report.failures.push({ stableEventId, error: error instanceof Error ? error.message : 'Unknown Google Calendar error' })
    }
  }

  return report
}
