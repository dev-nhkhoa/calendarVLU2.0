import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

describe('Integration: CSRF Protection', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
  })

  describe('Content-Type validation', () => {
    it('accepts only application/json Content-Type', async () => {
      const events = [
        {
          calendarId: 'primary',
          summary: 'Test Event',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ events }),
        }),
      )

      // Should succeed with proper content type
      expect(response.status).toBe(200)
    })

    it('rejects text/plain Content-Type with JSON payload', async () => {
      const events = [
        {
          calendarId: 'primary',
          summary: 'Test Event',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'text/plain', // Wrong content type
          },
          body: JSON.stringify({ events }), // Valid JSON payload
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Content-Type must be application/json')
    })

    it('rejects missing Content-Type header', async () => {
      const events = [
        {
          calendarId: 'primary',
          summary: 'Test Event',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            // No content-type header
          },
          body: JSON.stringify({ events }),
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Content-Type must be application/json')
    })

    it('rejects malformed JSON in text/plain payload', async () => {
      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'text/plain',
          },
          body: '{"events": [{"calendarId": "primary", "summary": "Test Event"', // Malformed JSON
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Content-Type must be application/json')
    })
  })

  describe('Origin validation', () => {
    it('accepts requests from allowed origins', async () => {
      const events = [
        {
          calendarId: 'primary',
          summary: 'Test Event',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ events }),
        }),
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('access-control-allow-origin')).toBe('https://calendarvlu.test')
    })

    it('rejects requests from unauthorized origins', async () => {
      const events = [
        {
          calendarId: 'primary',
          summary: 'Test Event',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://evil-attacker.com',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ events }),
        }),
      )

      expect(response.status).toBe(403)
      const result = await response.json()
      expect(result.error).toBe('Origin not allowed')
    })

    it('allows same-origin requests without Origin header', async () => {
      const events = [
        {
          calendarId: 'primary',
          summary: 'Test Event',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            // No origin header (same-origin request)
          },
          body: JSON.stringify({ events }),
        }),
      )

      expect(response.status).toBe(200)
    })
  })

  describe('OPTIONS preflight handling', () => {
    it('responds correctly to OPTIONS requests', async () => {
      const response = await fetch('https://calendarvlu.test/api/google/calendars/events', {
        method: 'OPTIONS',
        headers: {
          origin: 'https://calendarvlu.test',
        },
      })

      expect(response.status).toBe(204)
      expect(response.headers.get('access-control-allow-origin')).toBe('https://calendarvlu.test')
      expect(response.headers.get('access-control-allow-methods')).toBe('GET, POST, OPTIONS')
      expect(response.headers.get('access-control-allow-headers')).toBe('Content-Type, Authorization')
      expect(response.headers.get('access-control-allow-credentials')).toBe('true')
    })

    it('rejects OPTIONS from unauthorized origins', async () => {
      const response = await fetch('https://calendarvlu.test/api/google/calendars/events', {
        method: 'OPTIONS',
        headers: {
          origin: 'https://unauthorized-origin.com',
        },
      })

      expect(response.status).toBe(403)
      const result = await response.json()
      expect(result.error).toBe('Origin not allowed')
    })
  })

  describe('CSRF bypass prevention', () => {
    it('prevents simple request CSRF with text/plain content type', async () => {
      // This simulates a CSRF attack where an attacker tricks the browser
      // into making a POST request with text/plain content type containing JSON
      const maliciousPayload = JSON.stringify({
        events: [
          {
            calendarId: 'primary',
            summary: 'Hacked Event',
            startDate: '01/01/2025',
            endDate: '01/01/2025',
            startTime: '10:00',
            endTime: '11:00',
          },
        ],
      })

      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test', // Even from allowed origin
            'content-type': 'text/plain', // But wrong content type
          },
          body: maliciousPayload,
        }),
      )

      // Should be rejected despite valid JSON payload
      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Content-Type must be application/json')
    })

    it('validates JSON structure even with correct content type', async () => {
      const response = await POST(
        new Request('https://calendarvlu.test/api/google/calendars/events', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: 'invalid json',
        }),
      )

      expect(response.status).toBe(400)
      // Should fail JSON parsing
    })
  })
})