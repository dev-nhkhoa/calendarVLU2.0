import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const COOKIE = process.env.VLU_COOKIE
if (!COOKIE) {
  console.error('Usage: VLU_COOKIE="ASP.NET_SessionId=xxx; __sbref=xxx; _ga=xxx; _ga_S8NVNJR24D=xxx" npx tsx scripts/fetch-all-calendars.ts')
  throw new Error('Missing VLU_COOKIE')
}

const BASE_URL = 'https://online.vlu.edu.vn/Home'
const LICH = { study: 'DrawingStudentSchedule_Perior', exam: 'ShowExam' }
const YEAR_STUDIES = ['2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027']
const TERMS = ['HK01', 'HK02', 'HK03']
const TYPES = ['study', 'exam'] as const

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'test-fixtures', 'vlu-html')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

interface FetchResult {
  file: string
  yearStudy: string
  termId: string
  type: string
  status: number
  size: number
  skip: boolean
  error?: string
}

async function fetchAndSave(type: string, yearStudy: string, termId: string): Promise<FetchResult> {
  const filename = `vlu-${type}-${yearStudy}-${termId}.html`
  const filepath = join(OUT_DIR, filename)

  if (existsSync(filepath)) {
    return { file: filename, yearStudy, termId, type, status: 0, size: 0, skip: true }
  }

  const endpoint = type === 'study' ? LICH.study : LICH.exam
  const url = `${BASE_URL}/${endpoint}?YearStudy=${yearStudy}&TermID=${termId}`

  try {
    const response = await fetch(url, {
      headers: { Cookie: COOKIE! },
      redirect: 'manual',
    })

    const html = await response.text()
    writeFileSync(filepath, html, 'utf8')

    return { file: filename, yearStudy, termId, type, status: response.status, size: html.length, skip: false }
  } catch (err) {
    return { file: filename, yearStudy, termId, type, status: 0, size: 0, skip: false, error: String(err) }
  }
}

async function main() {
  console.log(`Fetching calendar HTML from ${BASE_URL}\n`)
  console.log(`Output: ${OUT_DIR}\n`)

  const results: FetchResult[] = []

  for (const type of TYPES) {
    for (const yearStudy of YEAR_STUDIES) {
      for (const termId of TERMS) {
        const result = await fetchAndSave(type, yearStudy, termId)
        results.push(result)
      }
    }
  }

  console.log('Results:')
  console.log('='.repeat(80))
  console.log('  File'.padEnd(45), 'Status', 'Size'.padStart(6))
  console.log('-'.repeat(80))

  for (const r of results) {
    if (r.error) {
      console.log(`  ${r.file.padEnd(45)} ERROR  ${r.error}`)
    } else if (r.skip) {
      console.log(`  ${r.file.padEnd(45)} SKIP  (already exists)`)
    } else {
      console.log(`  ${r.file.padEnd(45)} ${r.status}  ${String(r.size).padStart(6)} bytes`)
    }
  }

  console.log('\nSummary:')
  const total = results.length
  const fetched = results.filter(r => !r.skip && !r.error).length
  const skipped = results.filter(r => r.skip).length
  const errors = results.filter(r => r.error).length

  console.log(`  Total: ${total} files`)
  console.log(`  Fetched: ${fetched}`)
  console.log(`  Skipped (already exist): ${skipped}`)
  console.log(`  Errors: ${errors}`)
  console.log(`\nHTML files saved to: ${OUT_DIR}`)
}

main().catch(console.error)
