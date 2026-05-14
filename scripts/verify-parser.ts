import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseVluCalendar } from '../src/services/calendar-parser.js'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'test-fixtures', 'vlu-html')

interface TestResult {
  file: string
  ok: boolean
  eventCount: number
  warningCount: number
  error?: string
}

function detectType(filename: string): 'lichHoc' | 'lichThi' {
  if (filename.includes('study') || filename.includes('lichHoc')) return 'lichHoc'
  return 'lichThi'
}

function extractYearStudy(filename: string): string {
  // Try to extract from pattern like vlu-study-2025-2026-HK01
  const m = filename.match(/(\d{4}-\d{4})/)
  return m ? m[1] : '2025-2026'
}

async function main() {
  const files = readdirSync(DIR).filter(f => f.endsWith('.html')).sort()
  const results: TestResult[] = []

  console.log('Verifying parser against all HTML fixtures:\n')

  for (const file of files) {
    const html = readFileSync(join(DIR, file), 'utf8')
    const lichType = detectType(file)
    const yearStudy = extractYearStudy(file)

    try {
      const result = parseVluCalendar(html, yearStudy, lichType)
      results.push({
        file,
        ok: true,
        eventCount: result.data.length,
        warningCount: result.warnings.length,
      })
    } catch (err) {
      results.push({
        file,
        ok: false,
        eventCount: 0,
        warningCount: 0,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  console.log('  File'.padEnd(48), 'Status'.padEnd(10), 'Events'.padEnd(8), 'Warnings')
  console.log('  ' + '-'.repeat(85))

  let passed = 0
  let failed = 0

  for (const r of results) {
    const status = r.ok ? '✅ PASS' : '❌ FAIL'
    const events = r.ok ? String(r.eventCount) : '-'
    const warnings = r.ok ? String(r.warningCount) : '-'
    console.log(`  ${r.file.padEnd(48)} ${status.padEnd(10)} ${events.padEnd(8)} ${warnings}`)
    if (!r.ok) {
      console.log(`    Error: ${r.error}`)
      failed++
    } else {
      passed++
    }
  }

  console.log(`\n  ${'='.repeat(85)}`)
  console.log(`  Total: ${results.length}  |  Passed: ${passed}  |  Failed: ${failed}`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
