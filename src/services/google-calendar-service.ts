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
    }
  }
}

export function formatEventDate(dateStr: string, timeStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number)
  if (!day || !month || !year || !timeStr) throw new Error('Invalid calendar date or time')

  const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  return `${isoDate}T${timeStr}+07:00`
}

export function getStableEventId(item: CalendarType) {
  if (item.id) return item.id

  return [item.id, item.summary, item.startDate, item.startTime, item.endTime, item.location]
    .filter(Boolean)
    .join('|')
    .toLowerCase()
}

export function prepareCalendarEvents(calendarId: string, calendarData: CalendarType[]): GoogleCalendarEventInput[] {
  return calendarData.flatMap((item) => {
    try {
      const stableEventId = getStableEventId(item)

      return [
        {
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
          extendedProperties: {
            private: {
              source: 'vlu' as const,
              stableEventId,
            },
          },
        },
      ]
    } catch {
      return []
    }
  })
}
