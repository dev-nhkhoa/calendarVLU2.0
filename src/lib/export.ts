import { convertTime, defaultDateOfWeek } from '@/constants/calendar'
import { TableCalendarType } from '@/types/calendar'
import { Parser } from 'json2csv'
import { toast } from 'react-toastify'

type calendarJson = {
  Subject: string
  StartDate: string // định dạng: MM/DD/YYYY
  StartTime: string // định dạng: HH:MM AM/PM
  EndDate: string // định dạng: MM/DD/YYYY
  EndTime: string // định dạng: HH:MM AM/PM
  Description?: string // tùy chọn
  Location?: string // tùy chọn
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

function formatLichThiTime(time: string): string {
  const [hour, minute] = time.split('g').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00 ${period}`
}

const dayOfWeek: Record<string, number> = {
  Hai: 1,
  Ba: 2,
  Tư: 3,
  Năm: 4,
  Sáu: 5,
  Bảy: 6,
  'Chủ nhật': 7,
}

// Lấy ngày chính xác từ ngày thứ 2 và tên ngày trong tuần
export function getExactDate(monday: string, day: string) {
  const formatedDay = day.trim()
  if (!dayOfWeek[formatedDay]) throw new Error('Invalid day of week')
  const [dayM, monthM, yearM] = monday.split('/').map(Number)
  const mondayDate = new Date(yearM, monthM - 1, dayM)
  const targetDate = new Date(mondayDate)
  const dayNumber = dayOfWeek[formatedDay]
  targetDate.setDate(mondayDate.getDate() + dayNumber - 1)
  return `${String(targetDate.getDate()).padStart(2, '0')}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${targetDate.getFullYear()}`
}

export function lichHocToCsv(calendars: TableCalendarType[], yearStudy: string): string {
  const events: calendarJson[] = []

  calendars.map((calendar) => {
    const { description, learningDate, learningTime, location, summary, weeks } = calendar

    if (!learningTime || !learningDate || weeks.length == 0) {
      toast.error('Lịch học không hợp lệ')
      throw new Error('Lịch học không hợp lệ')
    }

    weeks.forEach((week: string) => {
      const [monday] = getMondayDate(yearStudy, parseInt(week))
      const exactDate = getExactDate(monday, learningDate)

      const [dd, mm, yyyy] = exactDate.split('/')
      const formattedDate = `${mm}/${dd}/${yyyy}`

      const [StartTime, EndTime] = convertTime[learningTime]

      const event: calendarJson = {
        Subject: summary || '',
        StartDate: formattedDate,
        StartTime: StartTime,
        EndDate: formattedDate,
        EndTime: EndTime,
        Description: description as string,
        Location: location || '',
      }

      events.push(event)
    })
  })

  // Chuyển đổi sang CSV
  const parser = new Parser({
    fields: ['Subject', 'StartDate', 'StartTime', 'EndDate', 'EndTime', 'Location', 'Description'],
  })
  return parser.parse(events)
}

export function lichThiToCsv(calendars: TableCalendarType[]): string {
  const events: calendarJson[] = []

  calendars.map((calendar) => {
    const { learningDate, location, summary, learningTime } = calendar

    if (!learningDate || !learningTime) {
      toast.error('Lịch thi không hợp lệ')
      throw new Error('Lịch thi không hợp lệ')
    }

    const event: calendarJson = {
      Subject: summary?.trim() || '',
      StartDate: learningDate?.trim(),
      StartTime: formatLichThiTime(learningTime),
      EndDate: learningDate?.trim(),
      EndTime: formatLichThiTime(learningTime),
      Description: location?.trim(),
      Location: location?.trim(),
    }

    events.push(event)
  })

  // Chuyển đổi sang CSV
  const parser = new Parser({
    fields: ['Subject', 'StartDate', 'StartTime', 'EndDate', 'EndTime', 'Location', 'Description'],
  })
  return parser.parse(events)
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url

  a.download = filename
  a.click()
}
