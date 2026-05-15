/**
 * Error codes for calendar parser failures.
 * Each code maps to a specific failure mode with a stable identifier
 * that the extension and backend can display clearly.
 */
export enum CalendarServiceErrorCode {
  /** VLU server is unreachable or returned a non-200 */
  VluUnavailable = 'VLU_UNAVAILABLE',
  /** VLU session cookie is expired or invalid */
  CookieExpired = 'COOKIE_EXPIRED',
  /** Raw HTML/response could not be parsed at all */
  ParserFailed = 'PARSER_FAILED',
  /** lichType was not lichHoc or lichThi */
  InvalidCalendarType = 'INVALID_CALENDAR_TYPE',
  /** Raw response is empty or too short to contain calendar data */
  EmptyResponse = 'EMPTY_RESPONSE',
  /** Response is not valid HTML or does not contain expected table structure */
  InvalidResponseFormat = 'INVALID_RESPONSE_FORMAT',
  /** No table rows (<tr>) found in the response */
  NoTableRows = 'NO_TABLE_ROWS',
  /** Cookie value contains invalid characters per RFC 6265 */
  InvalidCookie = 'INVALID_COOKIE',
}

/**
 * Warning codes for non-fatal parser issues.
 * These signal degraded data that is still usable.
 */
export enum ParserWarningCode {
  /** An optional field was empty (e.g., location, teacher) */
  MissingField = 'MISSING_FIELD',
  /** An unrecognized day-of-week name was skipped */
  InvalidDayOfWeek = 'INVALID_DAY_OF_WEEK',
  /** A time slot string was not found in convertTime map */
  InvalidTimeSlot = 'INVALID_TIME_SLOT',
  /** A week number could not be parsed */
  InvalidWeekNumber = 'INVALID_WEEK_NUMBER',
  /** The yearStudy was not found in defaultDateOfWeek map */
  UnknownYearStudy = 'UNKNOWN_YEAR_STUDY',
  /** An event row had all empty/missing required fields and was skipped */
  RowSkipped = 'ROW_SKIPPED',
  /** No events were found — the schedule is empty for this term/type */
  EmptyResult = 'EMPTY_RESULT',
}

export class CalendarServiceError extends Error {
  constructor(
    public readonly code: CalendarServiceErrorCode,
    message: string,
    public readonly status = 500,
  ) {
    super(message)
    this.name = 'CalendarServiceError'
  }
}

export interface ParserWarning {
  code: ParserWarningCode
  message: string
  field?: string
  row?: number
  value?: string
}

export interface ParserResult<T> {
  data: T
  warnings: ParserWarning[]
}

export interface ParserDiagnostics {
  totalRows: number
  skippedRows: number
  eventsGenerated: number
  warnings: ParserWarning[]
  yearStudy: string
  lichType: string
  hasCookies: boolean
  cookiesLength: number
  responseSizeBytes: number
}
