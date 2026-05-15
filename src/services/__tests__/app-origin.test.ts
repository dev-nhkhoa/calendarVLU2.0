import { getAllowedAppOrigins, isAllowedAppOrigin, resolveAppCorsOrigin } from '../app-origin'
import type { NextRequest } from 'next/server'

describe('app origin helpers', () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl
    }
  })

  it('always allows the request origin for same-origin app requests', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

    const request = new Request('https://calendar-vlu.nhkhoa.site/api/google/calendars', {
      headers: { origin: 'https://calendar-vlu.nhkhoa.site' },
    })

    const nextRequest = request as unknown as NextRequest

    expect(isAllowedAppOrigin(nextRequest)).toBe(true)
    expect(getAllowedAppOrigins(nextRequest)).toContain('https://calendar-vlu.nhkhoa.site')
    expect(resolveAppCorsOrigin(nextRequest)).toBe('https://calendar-vlu.nhkhoa.site')
  })

  it('still rejects unrelated origins', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://calendar-vlu.nhkhoa.site'

    const request = new Request('https://calendar-vlu.nhkhoa.site/api/google/calendars', {
      headers: { origin: 'https://evil.example' },
    })

    const nextRequest = request as unknown as NextRequest

    expect(isAllowedAppOrigin(nextRequest)).toBe(false)
    expect(resolveAppCorsOrigin(nextRequest)).toBe('https://calendar-vlu.nhkhoa.site')
  })
})
