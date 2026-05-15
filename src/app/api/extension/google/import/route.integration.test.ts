import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

// Mock Google Calendar API responses
const mockGoogleResponses = {
  successfulBatch: [
    {
      id: 'google-event-1',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event-link-1',
    },
    {
      id: 'google-event-2',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event-link-2',
    },
  ],
  partialFailureBatch: [
    {
      id: 'google-event-3',
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event-link-3',
    },
    {
      error: {
        code: 403,
        message: 'Forbidden',
        errors: [{ domain: 'calendar', reason: 'forbiddenForCalendar' }],
      },
    },
  ],
}

function mockGoogleApi(successfulBatches: any[][], failureBatches: any[][] = []) {
  let callCount = 0
  global.fetch = jest.fn().mockImplementation((url, options) => {
    if (url.includes('googleapis.com/calendar/v3/calendars/')) {
      const batchIndex = Math.floor(callCount / 10) // Assuming 10 events per batch
      const batchResponse = successfulBatches[batchIndex] || failureBatches[batchIndex] || []

      callCount++

      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => batchResponse,
      })
    }

    // For other requests (like token validation)
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ calendars: [{ id: 'primary', summary: 'Primary Calendar' }] }),
    })
  }) as jest.Mock
}

describe('Integration: Google Import Flow', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
  })

  describe('successful batch import', () => {
    it('imports events in batches and reports correct statistics', async () => {
      mockGoogleApi([mockGoogleResponses.successfulBatch])

      const events = [
        {
          id: 'vlu-event-1',
          summary: 'Lập Trình Web',
          startDate: '08/09/2025',
          endDate: '08/09/2025',
          startTime: '07:00',
          endTime: '08:45',
          location: 'A101',
          teacher: 'Nguyễn Văn A',
        },
        {
          id: 'vlu-event-2',
          summary: 'Toán Cao Cấp',
          startDate: '11/09/2025',
          endDate: '11/09/2025',
          startTime: '09:00',
          endTime: '10:45',
          location: 'B202',
          teacher: 'Trần Thị B',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/google/import', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: 'primary',
            events,
            options: { mode: 'upsert', dryRun: false },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        report: {
          created: 2,
          updated: 0,
          skipped: 0,
          failed: 0,
        },
        job: {
          id: expect.stringMatching(/^.{8,}$/),
          status: 'success',
          calendarId: 'primary',
          eventCount: 2,
          report: {
            created: 2,
            updated: 0,
            skipped: 0,
            failed: 0,
          },
        },
      })

      // Verify Google API was called with correct structure
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"summary":"Lập Trình Web"'),
        }),
      )
    })

    it('handles partial failures in batch correctly', async () => {
      mockGoogleApi([], [mockGoogleResponses.partialFailureBatch])

      const events = [
        {
          id: 'vlu-event-1',
          summary: 'Lập Trình Web',
          startDate: '08/09/2025',
          endDate: '08/09/2025',
          startTime: '07:00',
          endTime: '08:45',
          location: 'A101',
          teacher: 'Nguyễn Văn A',
        },
        {
          id: 'vlu-event-2',
          summary: 'Toán Cao Cấp',
          startDate: '11/09/2025',
          endDate: '11/09/2025',
          startTime: '09:00',
          endTime: '10:45',
          location: 'B202',
          teacher: 'Trần Thị B',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/google/import', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: 'primary',
            events,
            options: { mode: 'upsert', dryRun: false },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        report: {
          created: 1, // One successful
          updated: 0,
          skipped: 0,
          failed: 1, // One failed
        },
        job: {
          status: 'success',
          report: {
            created: 1,
            updated: 0,
            skipped: 0,
            failed: 1,
          },
        },
      })
    })
  })

  describe('large batch handling', () => {
    it('handles events exceeding batch size limit', async () => {
      const largeEventsBatch = Array.from({ length: 150 }, (_, i) => ({
        id: `vlu-event-${i}`,
        summary: `Event ${i}`,
        startDate: '08/09/2025',
        endDate: '08/09/2025',
        startTime: '07:00',
        endTime: '08:45',
        location: 'Room 101',
        teacher: 'Teacher Name',
      }))

      // Mock responses for multiple batches
      const batchResponses = Array.from({ length: 15 }, () =>
        Array.from({ length: 10 }, (_, i) => ({
          id: `google-event-${i}`,
          status: 'confirmed',
        })),
      )

      mockGoogleApi(batchResponses)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/google/import', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: 'primary',
            events: largeEventsBatch,
            options: { mode: 'upsert', dryRun: false },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result.report.created).toBe(150)
      expect(result.report.failed).toBe(0)
      expect(result.job.eventCount).toBe(150)
    })
  })

  describe('rate limiting and retry', () => {
    it('handles Google API rate limiting with retry logic', async () => {
      let callCount = 0
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('googleapis.com/calendar/v3/calendars/')) {
          callCount++
          if (callCount === 1) {
            // First call returns rate limit error
            return Promise.resolve({
              ok: false,
              status: 429,
              json: async () => ({
                error: {
                  code: 429,
                  message: 'Rate limit exceeded',
                },
              }),
            })
          }
          // Subsequent calls succeed
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: 'google-event-1',
              status: 'confirmed',
            }),
          })
        }

        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ calendars: [{ id: 'primary' }] }),
        })
      }) as jest.Mock

      const events = [
        {
          id: 'vlu-event-1',
          summary: 'Test Event',
          startDate: '08/09/2025',
          endDate: '08/09/2025',
          startTime: '07:00',
          endTime: '08:45',
          location: 'A101',
          teacher: 'Test Teacher',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/google/import', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: 'primary',
            events,
            options: { mode: 'upsert', dryRun: false },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.report.created).toBe(1)

      // Verify retry happened (should be called 2 times: rate limit + success)
      expect(callCount).toBe(2)
    })
  })

  describe('security and validation', () => {
    it('validates extension origin before processing', async () => {
      mockGoogleApi([mockGoogleResponses.successfulBatch])

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/google/import', {
          method: 'POST',
          headers: {
            origin: 'https://unauthorized-origin.com',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: 'primary',
            events: [],
            options: { mode: 'upsert', dryRun: false },
          }),
        }),
      )

      expect(response.status).toBe(403)
      const result = await response.json()
      expect(result.error).toBe('Origin is not allowed')
    })

    it('validates request body structure', async () => {
      mockGoogleApi([])

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/google/import', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            // Missing required fields
            events: [],
          }),
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error.code).toBe('INVALID_REQUEST')
    })
  })
})