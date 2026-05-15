import { CalendarType } from '@/types/calendar'

function escapeIcalText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

function formatDateToIcal(dateStr: string, timeStr: string): string {
  const [day, month, year] = dateStr.split('/').map(Number)
  if (!day || !month || !year || !timeStr) throw new Error('Invalid calendar date or time')

  const time = timeStr.replace(/:/g, '')
  return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}T${time}`
}

function foldLine(line: string): string {
  const maxLen = 75
  if (line.length <= maxLen) return line

  let result = line.slice(0, maxLen)
  let remaining = line.slice(maxLen)
  while (remaining.length > 0) {
    const chunkLen = Math.min(remaining.length, maxLen - 1)
    result += '\r\n ' + remaining.slice(0, chunkLen)
    remaining = remaining.slice(chunkLen)
  }
  return result
}

function buildVTimezone(): string {
  return [
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Ho_Chi_Minh',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:ICT',
    'END:STANDARD',
    'END:VTIMEZONE',
  ].join('\r\n')
}

function buildVevent(event: CalendarType, uid: string): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}@calendarvlu`,
    `DTSTART;TZID=Asia/Ho_Chi_Minh:${formatDateToIcal(event.startDate, event.startTime)}`,
    `DTEND;TZID=Asia/Ho_Chi_Minh:${formatDateToIcal(event.endDate || event.startDate, event.endTime)}`,
    `SUMMARY:${escapeIcalText(event.summary || 'Không có tiêu đề')}`,
    `LOCATION:${escapeIcalText(event.location || 'Chưa xác định')}`,
    `DESCRIPTION:${escapeIcalText(event.description || 'Không có mô tả')}`,
    'END:VEVENT',
  ]

  return lines.map(foldLine).join('\r\n')
}

function getStableUid(event: CalendarType): string {
  if (event.id) return event.id

  return [event.summary, event.startDate, event.startTime, event.endTime, event.location]
    .filter(Boolean)
    .join('|')
    .toLowerCase()
}

export function calendar2Ical(calendars: CalendarType[]): string {
  const parts: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CalendarVLU//CalendarVLU//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:CalendarVLU`,
    `X-WR-TIMEZONE:Asia/Ho_Chi_Minh`,
  ]

  parts.push(buildVTimezone())

  for (const event of calendars) {
    const uid = getStableUid(event)
    parts.push(buildVevent(event, uid))
  }

  parts.push('END:VCALENDAR')

  return parts.join('\r\n') + '\r\n'
}
