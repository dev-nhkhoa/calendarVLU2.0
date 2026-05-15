import { defaultDateOfWeek } from '@/constants/calendar'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const dayOfWeek: Record<string, number> = {
  Hai: 1,
  Ba: 2,
  Tư: 3,
  Năm: 4,
  Sáu: 5,
  Bảy: 6,
  'Chủ Nhật': 7,
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url

  a.download = filename
  a.click()
}

export function convertGTime(time: string) {
  const cleaned = time.trim().toLowerCase()
  if (!cleaned) return cleaned

  let normalized = cleaned.replace(/p$/, '')

  if (/[gh.:]/.test(normalized)) {
    normalized = normalized.replace(/[gh]/, ':').replace(/\./, ':')
    const parts = normalized.split(':')
    const h = parts[0] || '00'
    const m = parts[1]?.padStart(2, '0') || '00'
    return `${h}:${m}:00`
  }

  return normalized + ':00:00'
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return time
  const total = h * 60 + m + minutes
  const rh = Math.floor(total / 60) % 24
  const rm = total % 60
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}:00`
}

export function formatText(text: string | null): string | undefined {
  if (!text) return undefined
  return text.replace(/\s+|\n/g, ' ').trim()
}

export function getMondayDate(yearStudy: string, week: number) {
  if (!defaultDateOfWeek[yearStudy]) throw new Error('Year study not found')

  const firstMonday = defaultDateOfWeek[yearStudy][0]
  const [day, month, year] = firstMonday.split('/').map(Number)

  const firstMondayDate = new Date(Date.UTC(year, month - 1, day))

  const targetMonday = new Date(firstMondayDate)
  targetMonday.setUTCDate(firstMondayDate.getUTCDate() + (week - 1) * 7)

  const targetSunday = new Date(targetMonday)
  targetSunday.setUTCDate(targetMonday.getUTCDate() + 6)

  const formatDate = (date: Date) => {
    return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`
  }

  return [formatDate(targetMonday), formatDate(targetSunday)]
}

export function getExactDate(monday: string, day: string) {
  const formatedDay = day.trim()
  if (!dayOfWeek[formatedDay]) {
    throw new Error('Invalid day of week')
  }
  const [dayM, monthM, yearM] = monday.split('/').map(Number)
  const mondayDate = new Date(Date.UTC(yearM, monthM - 1, dayM))
  const targetDate = new Date(mondayDate)
  const dayNumber = dayOfWeek[formatedDay]
  targetDate.setUTCDate(mondayDate.getUTCDate() + dayNumber - 1)
  return `${String(targetDate.getUTCDate()).padStart(2, '0')}/${String(targetDate.getUTCMonth() + 1).padStart(2, '0')}/${targetDate.getUTCFullYear()}`
}
