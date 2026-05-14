import { createFormData, getVluCookie } from '@/actions/vlu'
import { deprecatedVluPasswordFlowHeaders } from '@/services/deprecation'
import { NextRequest } from 'next/server'

/**
 * Handles the GET request to login to VLU.
 *
 * @deprecated This endpoint uses VLU passwords and will be removed.
 * Use the Chrome extension flow instead.
 *
 * @param req - The request object containing `id` and `password` as query parameters.
 * @returns A Response object with the login cookie if successful, or an error message.
 */

export async function GET(req: NextRequest) {
  const { id, password } = Object.fromEntries(new URL(req.url).searchParams)

  if (!id || !password) return new Response('Missing id or password', { status: 400, headers: deprecatedVluPasswordFlowHeaders })

  const vluCookie = await getVluCookie()
  if (!vluCookie) return Response.json({ error: 'Failed to fetch vlu cookie' }, { status: 503, headers: deprecatedVluPasswordFlowHeaders })

  const header = new Headers()
  header.append('Cookie', vluCookie)

  const loginResponse = await fetch(process.env.VLU_LOGIN_URL as string, {
    method: 'POST',
    headers: header,
    body: await createFormData(id, password),
    redirect: 'manual',
  })

  if (loginResponse.status !== 302) return Response.json({ error: 'Failed to login to VLU' }, { status: 503, headers: deprecatedVluPasswordFlowHeaders })

  return Response.json(vluCookie, {
    status: 200,
    headers: {
      ...deprecatedVluPasswordFlowHeaders,
      'X-Deprecation-Notice': 'This API uses VLU passwords. Use /api/extension/vlu/calendars instead.',
    },
  })
}
