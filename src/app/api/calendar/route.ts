import { getCalendar, saveCalendar } from '@/actions/calendar'
import { getCurrentTermID, getCurrentYearStudy, LICH } from '@/lib/calendar'
import { NextRequest } from 'next/server'

const { JSDOM } = await import('jsdom')

function formatRawCalendar(rawSchedule: string): string {
  const dom = new JSDOM(rawSchedule)
  const document = dom.window.document

  const rows = document.querySelectorAll('tbody tr')
  const data: { [key: number]: { id: string; name: string; date: string; time: string; location: string; teacher: string; weeks: number[] } } = {}

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td')
    data[index + 1] = {
      id: cells[1]?.textContent?.trim() || '',
      name: cells[2]?.textContent?.trim() || '',
      date: cells[5]?.textContent?.trim() || '',
      time: cells[6]?.textContent?.trim() || '',
      location: cells[7]?.textContent?.trim() || '',
      teacher: cells[8]?.textContent?.trim() || '',
      weeks: cells[9]?.textContent?.trim().split(',').map(Number) || [],
    }
  })

  return JSON.stringify(data)
}

const url = 'https://online.vlu.edu.vn/Home/'

export async function POST(req: NextRequest) {
  // eslint-disable-next-line prefer-const
  let { termId, yearStudy, cookie, userId, lichType } = await req.json()

  if (!userId) return new Response('Missing userId', { status: 400 })

  termId = termId ?? getCurrentTermID()
  yearStudy = yearStudy ?? getCurrentYearStudy()
  const getLich = lichType == 'lichHoc' ? LICH.LichHoc : LICH.LichThi

  // cần check trong db xem đã lưu lịch chưa, nếu có thì trả về lịch đã lưu còn không thì fetch vlu để lấy lịch
  const getDbCalendar = await getCalendar(userId, termId, yearStudy, lichType)

  if (getDbCalendar) return new Response(JSON.stringify(getDbCalendar), { status: 200, headers: { 'Content-Type': 'application/json' } })

  // code 200 && status ok thì lấy được lịch
  const response = await fetch(`${url}/${getLich}?YearStudy=${yearStudy}&TermID=${termId}`, {
    method: 'GET',
    headers: { Cookie: cookie },
    redirect: 'manual',
  })

  // Log thông báo hết hạn, trả về status 501 để client biết và xử lý lấy cookie mới
  if (!response.ok || response.status != 200) return new Response('Cookie Expired!', { status: 501 })

  // Lấy lịch học từ response raw
  const rawCalendar = (await response.text()).trim()

  const formattedCalendar = formatRawCalendar(rawCalendar)

  // lưu lịch vào db
  const savedCalendar = await saveCalendar(userId, formattedCalendar, termId, yearStudy, lichType)

  return new Response(JSON.stringify(savedCalendar), { status: 201, headers: { 'Content-Type': 'application/json' } })
}
