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
  return time.replace('g', ':') + ':00'
}

export function formatText(text: string | null): string | undefined {
  if (!text) return undefined
  return text.replace(/\s+|\n/g, ' ').trim()
}

export function getMondayDate(yearStudy: string, week: number) {
  // Kiểm tra xem yearStudy có tồn tại trong defaultDateOfWeek không
  if (!defaultDateOfWeek[yearStudy]) throw new Error('Year study not found')

  // Lấy ngày thứ 2 đầu tiên của năm học
  const firstMonday = defaultDateOfWeek[yearStudy][0]
  const [day, month, year] = firstMonday.split('/').map(Number)

  // Tạo đối tượng Date từ ngày thứ 2 đầu tiên
  const firstMondayDate = new Date(year, month - 1, day)

  // Tính toán ngày bắt đầu của tuần được yêu cầu
  const targetMonday = new Date(firstMondayDate)
  targetMonday.setDate(firstMondayDate.getDate() + (week - 1) * 7)

  // Tính toán ngày Chủ Nhật của tuần đó
  const targetSunday = new Date(targetMonday)
  targetSunday.setDate(targetMonday.getDate() + 6)

  // Định dạng ngày thành dd/mm/yyyy
  const formatDate = (date: Date) => {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  }

  // Trả về mảng chứa ngày thứ 2 và Chủ Nhật
  return [formatDate(targetMonday), formatDate(targetSunday)]
}

// Lấy ngày chính xác từ ngày thứ 2 và tên ngày trong tuần
export function getExactDate(monday: string, day: string) {
  const formatedDay = day.trim()
  if (!dayOfWeek[formatedDay]) {
    console.log(formatedDay)
    throw new Error('Invalid day of week')
  }
  const [dayM, monthM, yearM] = monday.split('/').map(Number)
  const mondayDate = new Date(yearM, monthM - 1, dayM)
  const targetDate = new Date(mondayDate)
  const dayNumber = dayOfWeek[formatedDay]
  targetDate.setDate(mondayDate.getDate() + dayNumber - 1)
  return `${String(targetDate.getDate()).padStart(2, '0')}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${targetDate.getFullYear()}`
}
