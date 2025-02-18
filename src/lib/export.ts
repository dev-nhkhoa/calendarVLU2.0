import { Parser } from 'json2csv'

const defaultDateOfWeek: Record<string, [string, string]> = {
  '2023-2024': ['04/09/2023', '10/09/2023'], // Giá trị đầu tiên là thứ 2, cuối cùng là chủ nhật
  '2024-2025': ['02/09/2024', '08/09/2024'], // Đã sửa ngày bắt đầu cho năm học 2024-2025
}

const learningTime: Record<string, [string, string]> = {
  '1 - 3': ['07:00:00 AM', '09:30:00 AM'],
  '2 - 4': ['08:00:00 AM', '10:30:00 AM'],
  '4 - 6': ['09:30:00 AM', '12:00:00 PM'],
  '5 - 7': ['10:30:00 AM', '01:00:00 PM'],
  '7 - 9': ['01:00:00 PM', '03:30:00 PM'],
  '8 - 10': ['02:00:00 PM', '04:30:00 PM'],
  '10 - 12': ['03:30:00 PM', '06:00:00 PM'],
  '11 - 13': ['04:30:00 PM', '07:00:00 PM'],
  '13 - 15': ['06:00:00 PM', '08:30:00 PM'],
}

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
  if (!defaultDateOfWeek[yearStudy]) {
    throw new Error('Year study not found')
  }

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
  const [dayM, monthM, yearM] = monday.split('/').map(Number)
  const mondayDate = new Date(yearM, monthM - 1, dayM)
  const targetDate = new Date(mondayDate)
  const dayNumber = dayOfWeek[day] || 0
  targetDate.setDate(mondayDate.getDate() + dayNumber - 1)
  return `${String(targetDate.getDate()).padStart(2, '0')}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${targetDate.getFullYear()}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calendarToCsv(calendar: Record<string, any>, yearStudy: string): string {
  const events: calendarJson[] = []

  for (const key in calendar) {
    const subject = calendar[key]
    const { name, date, time, location, teacher, weeks } = subject

    // Kiểm tra xem time có tồn tại trong learningTime không
    if (!learningTime[time]) {
      throw new Error(`Không tìm thấy khung giờ cho '${time}'`)
    }

    // Lấy StartTime và EndTime từ learningTime
    const [StartTime, EndTime] = learningTime[time]

    weeks.forEach((week: number) => {
      const [monday] = getMondayDate(yearStudy, week)
      const exactDate = getExactDate(monday, date)

      // Định dạng lại ngày từ dd/mm/yyyy sang MM/DD/YYYY
      const [dd, mm, yyyy] = exactDate.split('/')
      const formattedDate = `${mm}/${dd}/${yyyy}`

      // Tạo sự kiện
      const event: calendarJson = {
        Subject: name,
        StartDate: formattedDate, // Định dạng MM/DD/YYYY
        StartTime: StartTime,
        EndDate: formattedDate, // Cùng ngày với StartDate
        EndTime: EndTime,
        Description: `Giảng viên: ${teacher}`,
        Location: location,
      }

      events.push(event)
    })
  }

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
