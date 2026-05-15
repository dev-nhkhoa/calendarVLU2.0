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

const COOKIE_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~a-zA-Z0-9]+$/
const INVALID_COOKIE_VALUE_CHARS = /[;,\s"\\]/

export function validateCookieValue(cookieHeader: string): string {
  const parts = cookieHeader.split(';').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) {
    throw new CalendarServiceError(CalendarServiceErrorCode.InvalidCookie, 'Cookie header is empty', 400)
  }

  for (const part of parts) {
    const eqIndex = part.indexOf('=')
    if (eqIndex === -1) {
      throw new CalendarServiceError(CalendarServiceErrorCode.InvalidCookie, `Invalid cookie format: missing '=' in "${part}"`, 400)
    }
    const name = part.slice(0, eqIndex).trim()
    const value = part.slice(eqIndex + 1).trim()

    if (!name || !COOKIE_NAME_PATTERN.test(name)) {
      throw new CalendarServiceError(CalendarServiceErrorCode.InvalidCookie, `Invalid cookie name: "${name}"`, 400)
    }

    if (INVALID_COOKIE_VALUE_CHARS.test(value)) {
      throw new CalendarServiceError(CalendarServiceErrorCode.InvalidCookie, `Cookie value for "${name}" contains invalid characters`, 400)
    }
  }

  return cookieHeader
}

export async function fetchRawVluCalendar(input: FetchVluCalendarInput) {
  const getLich = input.lichType === 'lichHoc' ? LICH.LichHoc : LICH.LichThi
  const url = resolveVluBaseUrl()
  url.pathname = `${url.pathname.replace(/\/$/, '')}/${getLich}`
  url.searchParams.set('YearStudy', input.yearStudy)
  url.searchParams.set('TermID', input.termId)

  const safeCookie = validateCookieValue(input.cookie)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Cookie: safeCookie },
      redirect: 'manual',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === 'AbortError'
    console.error('[VLU fetch] Network error', {
      isAbort,
      error: String(error),
      url: url.toString(),
    })
    throw new CalendarServiceError(
      CalendarServiceErrorCode.VluUnavailable,
      isAbort ? 'VLU request timed out (10s)' : 'VLU network error',
      503,
    )
  }

  if (response.status !== 200 || !response.ok) {
    const location = response.headers.get('location')
    const bodyPreview = await response.text().catch(() => '[unreadable]')
    console.error('[VLU fetch] Non-200 response from VLU', {
      status: response.status,
      statusText: response.statusText,
      redirectLocation: location,
      bodyPreview: bodyPreview.slice(0, 500),
      url: url.toString(),
    })
    throw new CalendarServiceError(CalendarServiceErrorCode.CookieExpired, 'VLU session is expired or invalid', 401)
  }

  return response.text()
}
