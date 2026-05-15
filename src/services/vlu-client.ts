import { LICH } from '@/lib/calendar'
import { CalendarServiceError, CalendarServiceErrorCode } from './errors'

export interface FetchVluCalendarInput {
  cookie: string
  termId: string
  yearStudy: string
  lichType: 'lichHoc' | 'lichThi'
}

const ALLOWED_VLU_HOSTS = ['online.vlu.edu.vn']

function isPrivateOrLocalHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '::1' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    hostname.startsWith('169.254.')
  )
}

export function resolveVluBaseUrl() {
  const baseUrl = process.env.VLU_HOME_URL

  if (!baseUrl) {
    throw new CalendarServiceError(CalendarServiceErrorCode.VluUnavailable, 'VLU home URL is not configured', 500)
  }

  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    throw new CalendarServiceError(CalendarServiceErrorCode.VluUnavailable, 'VLU home URL is invalid', 500)
  }

  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
    throw new CalendarServiceError(CalendarServiceErrorCode.VluUnavailable, 'VLU home URL is not allowed', 500)
  }

  const hostname = url.hostname.toLowerCase()
  const isAllowedVluHost = ALLOWED_VLU_HOSTS.includes(hostname) || hostname.endsWith('.vlu.edu.vn')
  if (!isAllowedVluHost || isPrivateOrLocalHostname(hostname)) {
    throw new CalendarServiceError(CalendarServiceErrorCode.VluUnavailable, 'VLU home URL host is not allowed', 500)
  }

  return url
}

export async function fetchRawVluCalendar(input: FetchVluCalendarInput) {
  const getLich = input.lichType === 'lichHoc' ? LICH.LichHoc : LICH.LichThi
  const url = resolveVluBaseUrl()
  url.pathname = `${url.pathname.replace(/\/$/, '')}/${getLich}`
  url.searchParams.set('YearStudy', input.yearStudy)
  url.searchParams.set('TermID', input.termId)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Cookie: input.cookie },
    redirect: 'manual',
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))

  if (response.status !== 200 || !response.ok) {
    throw new CalendarServiceError(CalendarServiceErrorCode.CookieExpired, 'VLU session is expired or invalid', 401)
  }

  return response.text()
}
