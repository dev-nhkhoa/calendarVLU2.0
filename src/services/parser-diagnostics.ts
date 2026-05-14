import { ParserDiagnostics } from './errors'

export interface SanitizedParserDiagnostics {
  totalRows: number
  skippedRows: number
  eventsGenerated: number
  warnings: Array<{
    code: string
    message: string
    field?: string
    row?: number
  }>
  yearStudy: string
  lichType: string
  hasCookies: boolean
  cookiesLength: number
  responseSizeBytes: number
  redacted: string[]
}

/**
 * Build parser diagnostics with all sensitive data redacted.
 * Never includes cookies, passwords, tokens, or raw response bodies.
 */
export function buildParserDiagnostics(input: ParserDiagnostics): SanitizedParserDiagnostics {
  const redacted: string[] = []

  if (input.hasCookies) {
    redacted.push('cookies')
  }

  return {
    totalRows: input.totalRows,
    skippedRows: input.skippedRows,
    eventsGenerated: input.eventsGenerated,
    warnings: input.warnings.map((w) => ({
      code: w.code,
      message: w.message,
      field: w.field,
      row: w.row,
    })),
    yearStudy: input.yearStudy,
    lichType: input.lichType,
    hasCookies: input.hasCookies,
    cookiesLength: input.cookiesLength,
    responseSizeBytes: input.responseSizeBytes,
    redacted,
  }
}

/**
 * Sanitize raw response for debug logging.
 * Strips all cookie-like content and truncates to a safe length.
 */
export function sanitizeRawResponse(raw: string, maxLength = 500): string {
  let sanitized = raw
    .replace(/Cookie:\s*[^\r\n]+/gi, 'Cookie: [REDACTED]')
    .replace(/Set-Cookie:\s*[^\r\n]+/gi, 'Set-Cookie: [REDACTED]')
    .replace(/ASP\.NET_SessionId=[^;"]+/gi, 'ASP.NET_SessionId=[REDACTED]')
    .replace(/\.ASPXAUTH=[^;"]+/gi, '.ASPXAUTH=[REDACTED]')

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + '... (truncated)'
  }

  return sanitized
}
