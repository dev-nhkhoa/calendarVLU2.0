export enum CalendarServiceErrorCode {
  VluUnavailable = 'VLU_UNAVAILABLE',
  CookieExpired = 'COOKIE_EXPIRED',
  ParserFailed = 'PARSER_FAILED',
  InvalidCalendarType = 'INVALID_CALENDAR_TYPE',
  InvalidCalendarData = 'INVALID_CALENDAR_DATA',
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
