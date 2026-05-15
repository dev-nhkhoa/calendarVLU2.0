import { getAccessToken } from '@/actions/google'
import { isAllowedAppOrigin, resolveAppCorsOrigin } from '@/services/app-origin'
import { NextRequest } from 'next/server'

function corsHeaders(request: NextRequest) {
  const allowedOrigin = resolveAppCorsOrigin(request)
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeaders(req) })
}

export async function GET(req: NextRequest) {
  if (!isAllowedAppOrigin(req)) {
    return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: corsHeaders(req) })
  }

  const accessToken = await getAccessToken()

  if (!accessToken) return Response.json({ error: 'Lỗi khi lấy access token' }, { status: 401, headers: corsHeaders(req) })

  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } })

  if (!response.ok) return Response.json({ error: 'Lỗi khi lấy danh sách calendar' }, { status: 503, headers: corsHeaders(req) })

  return Response.json(await response.json(), { status: 200, headers: corsHeaders(req) })
}
