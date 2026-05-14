import { buildParserDiagnostics, sanitizeRawResponse } from '../parser-diagnostics'

describe('S7-TC06: Parser diagnostics do not contain cookies or credentials', () => {
  it('redacts cookies from diagnostics output', () => {
    const diags = buildParserDiagnostics({
      totalRows: 5,
      skippedRows: 0,
      eventsGenerated: 10,
      warnings: [],
      yearStudy: '2025-2026',
      lichType: 'lichHoc',
      hasCookies: true,
      cookiesLength: 32,
      responseSizeBytes: 2048,
    })

    expect(diags.redacted).toContain('cookies')
    expect(JSON.stringify(diags)).not.toContain('secret')
    expect(diags.cookiesLength).toBe(32)
  })

  it('builds diagnostics without warnings', () => {
    const diags = buildParserDiagnostics({
      totalRows: 5,
      skippedRows: 0,
      eventsGenerated: 12,
      warnings: [],
      yearStudy: '2025-2026',
      lichType: 'lichThi',
      hasCookies: false,
      cookiesLength: 0,
      responseSizeBytes: 1024,
    })

    expect(diags.totalRows).toBe(5)
    expect(diags.eventsGenerated).toBe(12)
    expect(diags.warnings).toHaveLength(0)
  })

  it('includes parser warnings in diagnostics', () => {
    const diags = buildParserDiagnostics({
      totalRows: 3,
      skippedRows: 1,
      eventsGenerated: 2,
      warnings: [
        { code: 'MISSING_FIELD', message: 'Missing location', field: 'location', row: 2 },
        { code: 'ROW_SKIPPED', message: 'Row skipped', row: 3 },
      ],
      yearStudy: '2025-2026',
      lichType: 'lichHoc',
      hasCookies: false,
      cookiesLength: 0,
      responseSizeBytes: 500,
    })

    expect(diags.warnings).toHaveLength(2)
    expect(diags.warnings[0].code).toBe('MISSING_FIELD')
    expect(diags.warnings[1].code).toBe('ROW_SKIPPED')
  })
})

describe('sanitizeRawResponse', () => {
  it('redacts VLU cookies from raw response', () => {
    const raw = 'Cookie: ASP.NET_SessionId=abc123; .ASPXAUTH=def456'
    const sanitized = sanitizeRawResponse(raw)
    expect(sanitized).not.toContain('abc123')
    expect(sanitized).not.toContain('def456')
    expect(sanitized).toContain('[REDACTED]')
  })

  it('truncates long responses', () => {
    const long = 'x'.repeat(1000)
    const sanitized = sanitizeRawResponse(long, 100)
    expect(sanitized.length).toBeLessThan(200)
    expect(sanitized).toContain('(truncated)')
  })

  it('does not modify clean responses', () => {
    const clean = '<html><body>OK</body></html>'
    const sanitized = sanitizeRawResponse(clean)
    expect(sanitized).toBe(clean)
  })
})
