import { LICH } from '@/lib/calendar'
import { CalendarServiceError, CalendarServiceErrorCode } from './errors'

export interface FetchVluCalendarInput {
  cookie: string
  termId: string
  yearStudy: string
  lichType: 'lichHoc' | 'lichThi'
  baseUrl?: string
}

export async function fetchRawVluCalendar(input: FetchVluCalendarInput) {
  const getLich = input.lichType === 'lichHoc' ? LICH.LichHoc : LICH.LichThi
  const baseUrl = input.baseUrl ?? process.env.VLU_HOME_URL

  if (!baseUrl) {
    throw new CalendarServiceError(CalendarServiceErrorCode.VluUnavailable, 'VLU home URL is not configured', 500)
  }

  const response = await fetch(`${baseUrl}/${getLich}?YearStudy=${input.yearStudy}&TermID=${input.termId}`, {
    method: 'GET',
    headers: { Cookie: input.cookie },
    redirect: 'manual',
  })

  if (response.status !== 200 || !response.ok) {
    throw new CalendarServiceError(CalendarServiceErrorCode.CookieExpired, 'VLU session is expired or invalid', 401)
  }

  return response.text()
}
