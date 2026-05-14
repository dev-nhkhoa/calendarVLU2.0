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

export type CalendarEventType = z.infer<typeof calendarEventTypeSchema>
export type NormalizedCalendarEvent = z.infer<typeof normalizedCalendarEventSchema>
export type CalendarRequest = z.infer<typeof calendarRequestSchema>
