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
