import { getAccessToken } from '@/actions/google'
import { NextRequest } from 'next/server'

export async function GET() {
  const accessToken = await getAccessToken()

  console.log(accessToken)

  if (!accessToken) return Response.json({ error: 'Lỗi khi lấy access token' }, { status: 401 })

  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } })

  if (!response.ok) return Response.json({ error: 'Lỗi khi lấy danh sách calendar' }, { status: 503 })

  return Response.json(await response.json(), { status: 200 })
}

export async function POST(req: NextRequest) {
  const { calendarName } = await req.json()
  const accessToken = await getAccessToken()

  if (!accessToken) return Response.json({ error: 'Lỗi khi lấy access token' }, { status: 401 })

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: calendarName,
    }),
  })

  if (!response.ok) return Response.json({ error: 'Lỗi khi tạo calendar' }, { status: 503 })

  return Response.json(await response.json(), { status: 201 })
}
