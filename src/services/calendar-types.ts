import { z } from 'zod'

export const calendarSourceSchema = z.enum(['vlu'])
export const calendarEventTypeSchema = z.enum(['study', 'exam'])

export const normalizedCalendarEventSchema = z.object({
  id: z.string().optional(),
  source: calendarSourceSchema.default('vlu'),
  type: calendarEventTypeSchema.optional(),
  summary: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  term: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  private: z.boolean().nullable().optional(),
})

export const calendarRequestSchema = z.object({
  termId: z.string().min(1),
  yearStudy: z.string().min(1),
  lichType: z.enum(['lichHoc', 'lichThi']),
})

export const vluCookieSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  domain: z.string().optional(),
  path: z.string().optional(),
  secure: z.boolean().optional(),
  httpOnly: z.boolean().optional(),
})

export const extensionVluInputSchema = z.object({
  cookies: z.array(vluCookieSchema).min(1),
})

export const checkSessionRequestSchema = z.object({
  vlu: extensionVluInputSchema,
})

export const extensionCalendarsRequestSchema = z.object({
  vlu: extensionVluInputSchema,
  filters: z.object({
    types: z.array(calendarEventTypeSchema).default(['study']),
    termId: z.string().min(1),
    yearStudy: z.string().min(1),
  }),
})

export const extensionCsvRequestSchema = z.object({
  events: z.array(normalizedCalendarEventSchema),
  options: z
    .object({
      timezone: z.string().default('Asia/Ho_Chi_Minh'),
      filename: z.string().min(1).default('vlu-calendar.csv'),
    })
    .default({}),
})

export const extensionGoogleImportRequestSchema = z.object({
  events: z.array(normalizedCalendarEventSchema),
  calendarId: z.string().min(1).default('primary'),
  options: z
    .object({
      mode: z.enum(['upsert']).default('upsert'),
      dryRun: z.boolean().default(false),
    })
    .default({}),
})

export const extensionOutlookImportRequestSchema = z.object({
  events: z.array(normalizedCalendarEventSchema),
  options: z
    .object({
      dryRun: z.boolean().default(false),
    })
    .default({}),
})

export const extensionIcalRequestSchema = z.object({
  events: z.array(normalizedCalendarEventSchema),
  options: z
    .object({
      timezone: z.string().default('Asia/Ho_Chi_Minh'),
      filename: z.string().min(1).default('vlu-calendar.ics'),
    })
    .default({}),
})

export type CalendarEventType = z.infer<typeof calendarEventTypeSchema>
export type NormalizedCalendarEvent = z.infer<typeof normalizedCalendarEventSchema>
export type CalendarRequest = z.infer<typeof calendarRequestSchema>
export type VluCookie = z.infer<typeof vluCookieSchema>

export function formatCookieHeader(cookies: VluCookie[]) {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
}
