import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

describe('Integration: CSV Export Flow', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
  })

  describe('successful CSV export', () => {
    it('exports events to CSV with correct format and encoding', async () => {
      const events = [
        {
          id: 'vlu-1',
          summary: 'Lập Trình Web',
          description: 'Môn học lập trình web',
          location: 'A101 - Cơ sở 1',
          startDate: '08/09/2025',
          endDate: '10/09/2025',
          startTime: '07:00',
          endTime: '08:45',
        },
        {
          id: 'vlu-2',
          summary: 'Toán Cao Cấp',
          description: 'Môn toán nâng cao',
          location: 'B202 - Cơ sở 2',
          startDate: '11/09/2025',
          endDate: '13/09/2025',
          startTime: '09:00',
          endTime: '10:45',
        },
        {
          id: 'exam-1',
          summary: 'Kiểm Tra Cuối Kỳ - Lập Trình Web',
          description: 'Thi cuối kỳ',
          location: 'Phòng 101',
          startDate: '20/12/2025',
          endDate: '20/12/2025',
          startTime: '09:00',
          endTime: '11:30',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'vlu-calendar-export.csv',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result).toMatchObject({
        ok: true,
        filename: 'vlu-calendar-export.csv',
        csv: expect.stringContaining('Subject,Start Date,Start Time,End Date,End Time,Description,Location'),
      })

      // Verify CSV content structure
      const csvLines = result.csv.split('\n')
      expect(csvLines[0]).toBe('Subject,Start Date,Start Time,End Date,End Time,Description,Location')

      // Verify event data rows (skip header)
      const dataLines = csvLines.slice(1).filter(line => line.trim())
      expect(dataLines).toHaveLength(3)

      // Check first event
      expect(dataLines[0]).toContain('Lập Trình Web')
      expect(dataLines[0]).toContain('08/09/2025')
      expect(dataLines[0]).toContain('07:00')
      expect(dataLines[0]).toContain('10/09/2025')
      expect(dataLines[0]).toContain('08:45')
      expect(dataLines[0]).toContain('A101 - Cơ sở 1')

      // Check exam event
      expect(dataLines[2]).toContain('Kiểm Tra Cuối Kỳ - Lập Trình Web')
      expect(dataLines[2]).toContain('20/12/2025')
      expect(dataLines[2]).toContain('09:00')
      expect(dataLines[2]).toContain('11:30')
      expect(dataLines[2]).toContain('Phòng 101')
    })

    it('handles special characters and Vietnamese text correctly', async () => {
      const events = [
        {
          id: 'special-chars',
          summary: 'Môn Học Với Ký Tự Đặc Biệt: àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ',
          description: 'Mô tả với ký tự đặc biệt: @#$%^&*()[]{}',
          location: 'Phòng Học 101 - Tầng 1',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '08:00',
          endTime: '09:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'special-chars.csv',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result.csv).toContain('Môn Học Với Ký Tự Đặc Biệt')
      expect(result.csv).toContain('àáảãạăắằẳẵặâấầẩẫậđ')
      expect(result.csv).toContain('@#$%^&*()[]{}')
    })
  })

  describe('empty events handling', () => {
    it('returns error when no events provided', async () => {
      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events: [],
            options: {
              filename: 'empty.csv',
            },
          }),
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error.code).toBe('NO_EVENTS')
    })
  })

  describe('CSV format validation', () => {
    it('includes all required CSV headers', async () => {
      const events = [
        {
          id: 'test-event',
          summary: 'Test Event',
          description: 'Test description',
          location: 'Test location',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'headers-test.csv',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      const csvLines = result.csv.split('\n')
      const headers = csvLines[0]

      expect(headers).toBe('Subject,Start Date,Start Time,End Date,End Time,Description,Location')

      // Verify data row matches header order
      const dataRow = csvLines[1]
      const dataColumns = dataRow.split(',')
      expect(dataColumns).toHaveLength(7)
      expect(dataColumns[0]).toBe('"Test Event"')
      expect(dataColumns[1]).toBe('"01/01/2025"')
      expect(dataColumns[2]).toBe('"10:00"')
      expect(dataColumns[3]).toBe('"01/01/2025"')
      expect(dataColumns[4]).toBe('"11:00"')
      expect(dataColumns[5]).toBe('"Test description"')
      expect(dataColumns[6]).toBe('"Test location"')
    })

    it('properly escapes CSV special characters', async () => {
      const events = [
        {
          id: 'csv-escape-test',
          summary: 'Event with "quotes"',
          description: 'Description with,comma',
          location: 'Location with\nnewline',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'escape-test.csv',
            },
          }),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()

      // Verify quotes are properly escaped
      expect(result.csv).toContain('"Event with ""quotes"""')
      expect(result.csv).toContain('"Description with,comma"')
      expect(result.csv).toContain('"Location with\nnewline"')
    })
  })

  describe('security validation', () => {
    it('validates extension origin', async () => {
      const events = [
        {
          id: 'security-test',
          summary: 'Security Test',
          startDate: '01/01/2025',
          endDate: '01/01/2025',
          startTime: '10:00',
          endTime: '11:00',
        },
      ]

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
          method: 'POST',
          headers: {
            origin: 'https://evil-attacker.com',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            events,
            options: {
              filename: 'security-test.csv',
            },
          }),
        }),
      )

      expect(response.status).toBe(403)
      const result = await response.json()
      expect(result.error).toBe('Origin is not allowed')
    })

    it('validates content type', async () => {
      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/calendar/export-csv', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'text/plain', // Wrong content type
          },
          body: JSON.stringify({
            events: [],
            options: { filename: 'test.csv' },
          }),
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Content-Type must be application/json')
    })
  })
})