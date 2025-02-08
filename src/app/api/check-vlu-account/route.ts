import { NextRequest } from 'next/server'

export const vluUrl = 'https://online.vlu.edu.vn'
export const vluLoginUrl = `${vluUrl}/login`
export const vluHomeUrl = `${vluUrl}/Home`

export enum TermId {
  HK01 = 'HK01',
  HK02 = 'HK02',
  HK03 = 'HK03',
}

/**
 * Handles the GET request to login to VLU.
 *
 * @param req - The request object containing `id` and `password` as query parameters.
 * @returns A Response object with the login cookie if successful, or an error message.
 *
 * @example
 * // Request URL: /api/login?id=yourId&password=yourPassword
 * // Success response: { "cookie": "yourLoginCookie" }
 * // Failure response: "Failed to login to VLU"
 */

export async function GET(req: NextRequest) {
  const { id, password } = Object.fromEntries(new URL(req.url).searchParams)

  if (!id || !password) return new Response('Missing id or password', { status: 400 })

  // get vlu cookie
  const handleGetVluCookie = async () => {
    try {
      const fetchVluServer = await fetch(vluUrl)
      const loginCookie = fetchVluServer.headers.get('set-cookie')?.split(';')[0]
      return loginCookie
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Failed to get VLU cookie: ' + error.message)
      } else {
        throw new Error('Failed to get VLU cookie')
      }
    }
  }

  const loginCookie = await handleGetVluCookie()
  if (!loginCookie) return new Response('Failed to get VLU cookie', { status: 500 })

  // login to vlu
  const applyCookieHeader = new Headers()
  applyCookieHeader.append('Cookie', loginCookie)

  const applyAuth = new FormData()
  applyAuth.append('txtTaiKhoan', id)
  applyAuth.append('txtMatKhau', password)

  // thanks to @PhucChiVas161 for advice!
  const loginResponse = await fetch(vluLoginUrl, {
    method: 'POST',
    headers: applyCookieHeader,
    body: applyAuth,
    redirect: 'manual',
  })

  if (loginResponse.status !== 302) return new Response('Failed to login to VLU', { status: 500 })

  return new Response(JSON.stringify({ cookie: loginCookie }), { status: 200 })
}
