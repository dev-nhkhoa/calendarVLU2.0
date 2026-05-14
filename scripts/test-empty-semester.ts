import { writeFileSync } from 'fs'

const VLU_COOKIE = process.env.VLU_COOKIE
if (!VLU_COOKIE) {
  console.error('Usage: VLU_COOKIE="ASP.NET_SessionId=xxx" npx tsx scripts/test-empty-semester.ts')
  process.exit(1)
}

async function main() {
  const baseUrl = 'https://online.vlu.edu.vn/Home'
  const url = `${baseUrl}/DrawingStudentSchedule_Perior?YearStudy=2025-2026&TermID=HK02`

  console.log('Fetching:', url)
  console.log('Cookie:', VLU_COOKIE)

  const response = await fetch(url, {
    headers: { Cookie: VLU_COOKIE },
    redirect: 'manual',
  })

  console.log('Status:', response.status)
  console.log('Headers:', Object.fromEntries(response.headers.entries()))

  const html = await response.text()
  console.log('HTML length:', html.length)
  console.log('First 500 chars:', html.slice(0, 500))
  console.log('---')

  // Check for common VLU empty patterns
  if (html.includes('không có dữ liệu') || html.includes('không có lịch') || html.includes('Không có')) {
    console.log('PATTERN: VLU returned "không có" (no data) message')
  }
  if (html.includes('Không có lớp học nào') || html.includes('Không có môn học nào')) {
    console.log('PATTERN: VLU returned "Không có lớp/môn học" (no classes/subjects)')
  }

  // Count table rows
  const rowCount = (html.match(/<tr>/g) || []).length
  const tdCount = (html.match(/<td/g) || []).length
  console.log(`Table rows: ${rowCount}, Table cells: ${tdCount}`)

  // Save HTML for inspection
  writeFileSync('vlu-response.html', html, 'utf8')
  console.log('Full HTML saved to vlu-response.html')

  if (rowCount <= 1 && tdCount === 0) {
    console.log('CONCLUSION: No schedule data in table — semester has no classes or session is expired.')
  } else if (rowCount > 1) {
    console.log('CONCLUSION: Table data found — semester has schedule entries.')
  }
}

main().catch(console.error)
