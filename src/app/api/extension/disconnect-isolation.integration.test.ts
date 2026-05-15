import { POST as googleDisconnect } from '../google/disconnect/route'
import { POST as outlookDisconnect } from '../outlook/disconnect/route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

// Mock database operations
const mockPrisma = {
  account: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('Integration: Disconnect Token Isolation', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'

    // Reset all mocks
    jest.clearAllMocks()

    // Mock successful auth
    mockPrisma.account.findMany.mockResolvedValue([
      {
        id: 'google-account-1',
        provider: 'google',
        providerAccountId: 'google-user-123',
        access_token: 'google-access-token',
        refresh_token: 'google-refresh-token',
      },
      {
        id: 'outlook-account-1',
        provider: 'outlook',
        providerAccountId: 'outlook-user-456',
        access_token: 'outlook-access-token',
        refresh_token: 'outlook-refresh-token',
      },
    ])
  })

  describe('Google disconnect preserves Outlook tokens', () => {
    it('clears only Google tokens while keeping Outlook tokens intact', async () => {
      mockPrisma.account.updateMany.mockResolvedValue({ count: 1 })

      const response = await googleDisconnect(
        new Request('https://calendarvlu.test/api/extension/google/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result).toMatchObject({
        ok: true,
        message: 'Google account disconnected successfully',
      })

      // Verify only Google accounts were targeted
      expect(mockPrisma.account.updateMany).toHaveBeenCalledWith({
        where: {
          provider: 'google',
          userId: expect.any(String), // From auth context
        },
        data: {
          access_token: null,
          refresh_token: null,
        },
      })

      // Verify it was called only once for Google
      expect(mockPrisma.account.updateMany).toHaveBeenCalledTimes(1)
    })

    it('handles case where no Google accounts exist', async () => {
      mockPrisma.account.updateMany.mockResolvedValue({ count: 0 })

      const response = await googleDisconnect(
        new Request('https://calendarvlu.test/api/extension/google/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.message).toBe('No Google account found to disconnect')
    })
  })

  describe('Outlook disconnect preserves Google tokens', () => {
    it('clears only Outlook tokens while keeping Google tokens intact', async () => {
      mockPrisma.account.updateMany.mockResolvedValue({ count: 1 })

      const response = await outlookDisconnect(
        new Request('https://calendarvlu.test/api/extension/outlook/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result).toMatchObject({
        ok: true,
        message: 'Outlook account disconnected successfully',
      })

      // Verify only Outlook accounts were targeted
      expect(mockPrisma.account.updateMany).toHaveBeenCalledWith({
        where: {
          provider: 'outlook',
          userId: expect.any(String), // From auth context
        },
        data: {
          access_token: null,
          refresh_token: null,
        },
      })

      // Verify it was called only once for Outlook
      expect(mockPrisma.account.updateMany).toHaveBeenCalledTimes(1)
    })

    it('handles case where no Outlook accounts exist', async () => {
      mockPrisma.account.updateMany.mockResolvedValue({ count: 0 })

      const response = await outlookDisconnect(
        new Request('https://calendarvlu.test/api/extension/outlook/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.message).toBe('No Outlook account found to disconnect')
    })
  })

  describe('cross-provider token isolation', () => {
    it('disconnecting Google does not affect Outlook tokens', async () => {
      // Mock Google disconnect succeeds
      mockPrisma.account.updateMany.mockResolvedValueOnce({ count: 1 })

      await googleDisconnect(
        new Request('https://calendarvlu.test/api/extension/google/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      // Verify only Google provider was targeted
      expect(mockPrisma.account.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            provider: 'google',
          }),
        }),
      )

      // Verify Outlook was not touched
      expect(mockPrisma.account.updateMany).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            provider: 'outlook',
          }),
        }),
      )
    })

    it('disconnecting Outlook does not affect Google tokens', async () => {
      // Mock Outlook disconnect succeeds
      mockPrisma.account.updateMany.mockResolvedValueOnce({ count: 1 })

      await outlookDisconnect(
        new Request('https://calendarvlu.test/api/extension/outlook/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      // Verify only Outlook provider was targeted
      expect(mockPrisma.account.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            provider: 'outlook',
          }),
        }),
      )

      // Verify Google was not touched
      expect(mockPrisma.account.updateMany).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            provider: 'google',
          }),
        }),
      )
    })
  })

  describe('error handling', () => {
    it('handles database errors gracefully', async () => {
      mockPrisma.account.updateMany.mockRejectedValue(new Error('Database connection failed'))

      const response = await googleDisconnect(
        new Request('https://calendarvlu.test/api/extension/google/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(500)
      const result = await response.json()
      expect(result.error.code).toBe('DATABASE_ERROR')
    })

    it('validates content type', async () => {
      const response = await googleDisconnect(
        new Request('https://calendarvlu.test/api/extension/google/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'content-type': 'text/plain', // Wrong content type
          },
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Content-Type must be application/json')
    })

    it('requires valid extension origin', async () => {
      const response = await googleDisconnect(
        new Request('https://calendarvlu.test/api/extension/google/disconnect', {
          method: 'POST',
          headers: {
            origin: 'https://unauthorized-origin.com',
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(403)
      const result = await response.json()
      expect(result.error).toBe('Origin is not allowed')
    })
  })
})