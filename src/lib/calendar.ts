export enum TermID {
  HK01 = 'HK01',
  HK02 = 'HK02',
  HK03 = 'HK03',
}

export enum LICH {
  LichHoc = 'DrawingStudentSchedule_Perior',
  LichThi = 'ShowExam',
}

export function getCurrentTermID(): TermID {
  const currentMonth = new Date().getMonth()
  if (currentMonth < 6) return TermID.HK02
  if (currentMonth < 9) return TermID.HK03
  return TermID.HK01
}

export function getCurrentYearStudy(currentYear = new Date().getFullYear()): string {
  return `${currentYear - 1}-${currentYear}`
}

export function convertAMPMto24(timeString: string): string | null {
  // Sử dụng regex để tách các thành phần thời gian
  const timeRegex = /^(\d{2}):(\d{2}):(\d{2})\s(AM|PM)$/i
  const matches = timeString.match(timeRegex)

  console.log(matches)

  // Kiểm tra định dạng đầu vào
  if (!matches) return null

  // Trích xuất các thành phần
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, hours, minutes, seconds, period] = matches

  // Chuyển đổi giờ sang số
  let hourInt = parseInt(hours, 10)

  // Xử lý chuyển đổi AM/PM
  if (period.toUpperCase() === 'PM' && hourInt !== 12) {
    hourInt += 12
  } else if (period.toUpperCase() === 'AM' && hourInt === 12) {
    hourInt = 0
  }

  // Định dạng lại giờ với 2 chữ số
  const formattedHour = hourInt.toString().padStart(2, '0')

  // Trả về chuỗi thời gian mới
  return `${formattedHour}:${minutes}:${seconds}`
}
