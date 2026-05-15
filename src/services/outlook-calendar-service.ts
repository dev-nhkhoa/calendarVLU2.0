import { CalendarType } from '@/types/calendar'

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

export interface OutlookEventInput {
  subject: string
  body: {
    contentType: 'HTML'
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location: {
    displayName: string
  }
  categories: string[]
}

export interface OutlookImportReport {
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
  return `${isoDate}T${timeStr}:00`
}

export function getStableEventId(item: CalendarType) {
  if (item.id) return item.id

  return [item.summary, item.startDate, item.startTime, item.endTime, item.location]
    .filter(Boolean)
    .join('|')
    .toLowerCase()
}

export function getEventPayloadHash(input: { subject: string; location: string | { displayName: string }; start: { dateTime: string }; end: { dateTime: string } }) {
  const payload = JSON.stringify({
    subject: input.subject,
    location: typeof input.location === 'string' ? input.location : input.location.displayName,
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

export function prepareOutlookEvents(calendarData: CalendarType[]) {
  return calendarData.flatMap((item) => {
    try {
      const stableEventId = getStableEventId(item)

      const outlookEvent: OutlookEventInput = {
        subject: item.summary || 'Không có tiêu đề',
        body: {
          contentType: 'HTML',
          content: `<html><body>${(item.description || 'Không có mô tả').replace(/\n/g, '<br>')}</body></html>`,
        },
        start: {
          dateTime: formatEventDate(item.startDate, item.startTime),
          timeZone: item.timezone ?? 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: formatEventDate(item.endDate || item.startDate, item.endTime),
          timeZone: item.timezone ?? 'Asia/Ho_Chi_Minh',
        },
        location: {
          displayName: item.location || 'Chưa xác định',
        },
        categories: ['VLU'],
      }

      return [{
        ...outlookEvent,
        stableEventId,
        payloadHash: getEventPayloadHash(outlookEvent),
      }]
    } catch {
      return []
    }
  })
}

function getDateRange(events: CalendarType[]) {
  let start = Infinity
  let end = -Infinity

  for (const event of events) {
    const [, , sYear, sMonth, sDay] = /(\d+)\/(\d+)\/(\d+)/.exec(event.startDate) ?? []
    if (sYear) {
      const ts = new Date(Number(sYear), Number(sMonth) - 1, Number(sDay)).getTime()
      if (ts < start) start = ts
    }
    const [, , eYear, eMonth, eDay] = /(\d+)\/(\d+)\/(\d+)/.exec(event.endDate ?? event.startDate) ?? []
    if (eYear) {
      const ts = new Date(Number(eYear), Number(eMonth) - 1, Number(eDay)).getTime()
      if (ts > end) end = ts
    }
  }

  return {
    start: new Date(start - 86400000).toISOString(),
    end: new Date(end + 86400000 * 3).toISOString(),
  }
}

async function findExistingOutlookEvents(accessToken: string, startDate: string, endDate: string) {
  const url = new URL(`${GRAPH_BASE}/me/calendarView`)
  url.searchParams.set('startDateTime', startDate)
  url.searchParams.set('endDateTime', endDate)
  url.searchParams.set('$select', 'id,subject,start,end,categories')
  url.searchParams.set('$top', '200')

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new Error(`Graph API calendarView returned ${response.status}`)

  const data = (await response.json()) as { value?: Array<{ id: string; subject: string; start: { dateTime: string }; categories?: string[] }> }
  return (data.value ?? []).filter((event) => event.categories?.includes('VLU'))
}

function eventMatches(a: { subject: string; start: string }, b: { subject: string; start: string }) {
  return a.subject === b.subject && a.start === b.start
}

export async function importOutlookCalendarEvents(input: {
  accessToken: string
  events: CalendarType[]
  dryRun?: boolean
}): Promise<OutlookImportReport> {
  const outlookEvents = prepareOutlookEvents(input.events)
  const report: OutlookImportReport = { created: 0, updated: 0, skipped: 0, failed: 0, failures: [] }

  if (input.dryRun) {
    report.skipped = outlookEvents.length
    return report
  }

  if (!outlookEvents.length) return report

  const dateRange = getDateRange(input.events)
  const existingEvents = await findExistingOutlookEvents(input.accessToken, dateRange.start, dateRange.end)

  for (const event of outlookEvents) {
    try {
      const existing = existingEvents.find((e) =>
        eventMatches(
          { subject: event.subject, start: event.start.dateTime },
          { subject: e.subject, start: e.start.dateTime },
        ),
      )

      if (existing) {
        const response = await fetch(`${GRAPH_BASE}/me/events/${existing.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${input.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: event.subject,
            body: event.body,
            start: event.start,
            end: event.end,
            location: event.location,
            categories: event.categories,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          report.failed += 1
          report.failures.push({ stableEventId: event.stableEventId, error: errorText || `Graph API PATCH returned ${response.status}` })
          continue
        }
        report.updated += 1
      } else {
        const response = await fetch(`${GRAPH_BASE}/me/calendar/events`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${input.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })

        if (!response.ok) {
          const errorText = await response.text()
          report.failed += 1
          report.failures.push({ stableEventId: event.stableEventId, error: errorText || `Graph API POST returned ${response.status}` })
          continue
        }
        report.created += 1
      }
    } catch (error) {
      report.failed += 1
      report.failures.push({ stableEventId: event.stableEventId, error: error instanceof Error ? error.message : 'Unknown Outlook error' })
    }
  }

  return report
}
