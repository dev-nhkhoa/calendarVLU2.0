import { getAccessToken } from '@/actions/google'
import { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
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
  if (!isAllowedOrigin(req)) {
    return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: corsHeaders(req) })
  }

  const accessToken = await getAccessToken()

  if (!accessToken) return Response.json({ error: 'Lỗi khi lấy access token' }, { status: 401, headers: corsHeaders(req) })

  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } })

  if (!response.ok) return Response.json({ error: 'Lỗi khi lấy danh sách calendar' }, { status: 503, headers: corsHeaders(req) })

  return Response.json(await response.json(), { status: 200, headers: corsHeaders(req) })
}
