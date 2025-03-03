import { getAccessToken } from '@/actions/google'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const accessToken = await getAccessToken()

  if (!accessToken) return Response.json({ error: 'Can not get account access Token!' }, { status: 401 })

  const { calendarId } = Object.fromEntries(new URL(req.url).searchParams)

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) return Response.json({ error: 'Failed to fetch!' }, { status: 503 })

  return Response.json(await response.json(), { status: 200 })
}

// Type Definitions
interface GoogleEvent {
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
}

interface GoogleEventResponse {
  id: string
  status: string
  htmlLink?: string
  extendedProperties?: {
    private?: {
      originalCalendarId?: string
    }
  }
  [key: string]: unknown
}

interface SuccessfulEvent {
  event: GoogleEvent
  googleEventId: string
}

interface FailedEvent {
  event: GoogleEvent
  error: string
}

type ProcessingResult = { status: 'fulfilled'; value: GoogleEventResponse } | { status: 'rejected'; reason: FailedEvent }

export async function POST(req: NextRequest) {
  const accessToken = await getAccessToken()

  if (!accessToken) {
    return Response.json({ error: 'Can not get account access Token!' }, { status: 401 })
  }

  try {
    const { events }: { events?: GoogleEvent[] } = await req.json()

    if (!Array.isArray(events)) {
      return Response.json({ error: 'Invalid events format' }, { status: 400 })
    }

    const RATE_LIMIT_DELAY = 300
    const MAX_RETRIES = 3
    const BATCH_SIZE = 10

    const processedResults: ProcessingResult[] = []

    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE)

      const batchPromises = batch.map(async (event, index) => {
        const jitter = Math.random() * 50
        await new Promise((resolve) => setTimeout(resolve, index * RATE_LIMIT_DELAY + jitter))

        let retryCount = 0
        while (retryCount < MAX_RETRIES) {
          try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${event.calendarId}/events`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: event.summary,
                location: event.location,
                description: event.description,
                start: event.start,
                end: event.end,
              }),
            })

            if (response.status === 429 || response.status >= 500) {
              const delay = Math.pow(2, retryCount) * 1000
              await new Promise((resolve) => setTimeout(resolve, delay))
              retryCount++
              continue
            }

            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(errorText)
            }

            return (await response.json()) as GoogleEventResponse
          } catch (error) {
            retryCount++
            if (retryCount >= MAX_RETRIES) {
              throw {
                event,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            }
          }
        }
        throw {
          event,
          error: 'Max retries exceeded',
        }
      })

      const batchResults = (await Promise.allSettled(batchPromises)).map((result) => {
        if (result.status === 'fulfilled') {
          return {
            status: 'fulfilled' as const,
            value: result.value,
          }
        }
        return {
          status: 'rejected' as const,
          reason: result.reason,
        }
      })

      processedResults.push(...batchResults)
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY))
    }

    const successfulEvents: SuccessfulEvent[] = []
    const failedEvents: FailedEvent[] = []

    processedResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        successfulEvents.push({
          event: events.find((e) => e.calendarId === result.value.extendedProperties?.private?.originalCalendarId)!,
          googleEventId: result.value.id,
        })
      } else {
        failedEvents.push(result.reason)
      }
    })

    return Response.json(
      {
        success: failedEvents.length === 0,
        message: `${successfulEvents.length} succeeded, ${failedEvents.length} failed`,
        successfulEvents,
        failedEvents,
      },
      { status: failedEvents.length ? 207 : 200 },
    )
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
