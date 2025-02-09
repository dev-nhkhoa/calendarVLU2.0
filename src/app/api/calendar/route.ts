import { vluHomeURL } from '@/lib/urls'
import { NextRequest } from 'next/server'

const { JSDOM } = await import('jsdom')

export async function GET(req: NextRequest) {
  const { termID, lichType, yearStudy, loginCookie } = Object.fromEntries(new URL(req.url).searchParams)

  if (!termID || !lichType || !yearStudy || !loginCookie) return new Response('Missing termID, lichType or yearStudy', { status: 400 })

  // fetch to vlu to get lich hoc or lich thi
  let urlLichFetch = ''
  if (lichType == 'lichHoc') urlLichFetch = 'DrawingStudentSchedule_Perior'
  else if (lichType == 'lichThi') urlLichFetch = 'DrawingStudentExamSchedule_Perior'
  else return new Response('Invalid lichType', { status: 400 })

  const vluCalendar = await fetch(`${vluHomeURL}/${urlLichFetch}?YearStudy=${yearStudy}&TermID=${termID}`, {
    method: 'GET',
    headers: { Cookie: loginCookie },
    redirect: 'follow',
  })

  const vluCalendarText = await vluCalendar.text()
  const dom = new JSDOM(vluCalendarText)
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

  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
