import { createFormData, getVluCookie } from '@/actions/vlu'
import { NextRequest } from 'next/server'

/**
 * Handles the GET request to login to VLU.
 *
 * @param req - The request object containing `id` and `password` as query parameters.
 * @returns A Response object with the login cookie if successful, or an error message.
 *
 * @example
 * // Request URL: /api/accounts/vlu?id=yourId&password=yourPassword
 * // Success response: { "cookie": "yourVluCookie" }
 * // Failure response: { "error": "Failed to fetch vlu cookie" }
 */

export async function GET(req: NextRequest) {
  const { id, password } = Object.fromEntries(new URL(req.url).searchParams)

  if (!id || !password) return new Response('Missing id or password', { status: 400 })

  const vluCookie = await getVluCookie()
  if (!vluCookie) return Response.json({ error: 'Failed to fetch vlu cookie' }, { status: 503 })

  // login to vlu
  const header = new Headers()
  header.append('Cookie', vluCookie)

  // thanks to @PhucChiVas161 for the advice!
  const loginResponse = await fetch(process.env.VLU_LOGIN_URL as string, {
    method: 'POST',
    headers: header,
    body: await createFormData(id, password),
    redirect: 'manual',
  })

  if (loginResponse.status !== 302) return Response.json({ error: 'Failed to login to VLU' }, { status: 503 })

  console.log(await loginResponse)

  return Response.json(vluCookie, { status: 200 })
}
