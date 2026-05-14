import { getAccessToken } from '@/actions/google'

export async function GET() {
  const accessToken = await getAccessToken()

  if (!accessToken) return Response.json({ error: 'Lỗi khi lấy access token' }, { status: 401 })

  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } })

  if (!response.ok) return Response.json({ error: 'Lỗi khi lấy danh sách calendar' }, { status: 503 })

  return Response.json(await response.json(), { status: 200 })
}
