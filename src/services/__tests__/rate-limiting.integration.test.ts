import { POST } from './route'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'

describe('Integration: Rate Limiting Persistence', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
    process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  })

  describe('Redis persistence across requests', () => {
    it('maintains rate limit counters across multiple requests', async () => {
      // Mock Redis to simulate persistence
      const redisMock = {
        hget: jest.fn(),
        hset: jest.fn(),
        hincrby: jest.fn(),
        expire: jest.fn(),
      }

      // Mock the Redis module
      jest.doMock('@upstash/redis', () => ({
        Redis: jest.fn().mockImplementation(() => redisMock),
      }))

      // Reset counters for clean state
      redisMock.hget.mockResolvedValue(null)
      redisMock.hset.mockResolvedValue('OK')
      redisMock.hincrby.mockResolvedValue(1)
      redisMock.expire.mockResolvedValue(1)

      const maxRequests = 5

      // Make multiple requests up to the limit
      for (let i = 1; i <= maxRequests; i++) {
        const response = await POST(
          new Request('https://calendarvlu.test/api/extension/google/calendars', {
            method: 'POST',
            headers: {
              origin: 'https://calendarvlu.test',
              'x-forwarded-for': '127.0.0.1', // Simulate client key derivation
            },
          }),
        )

        if (i < maxRequests) {
          // Should succeed until limit reached
          expect(response.status).toBe(200)
        }
      }

      // Next request should be rate limited
      const rateLimitedResponse = await POST(
        new Request('https://calendarvlu.test/api/extension/google/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'x-forwarded-for': '127.0.0.1',
          },
        }),
      )

      expect(rateLimitedResponse.status).toBe(429)
      const result = await rateLimitedResponse.json()
      expect(result.error).toBe('Too many requests. Try again later.')

      // Verify Redis operations were called
      expect(redisMock.hget).toHaveBeenCalled()
      expect(redisMock.hset).toHaveBeenCalled()
      expect(redisMock.hincrby).toHaveBeenCalled()
      expect(redisMock.expire).toHaveBeenCalled()
    })

    it('falls back to in-memory when Redis is unavailable', async () => {
      // Mock Redis failure
      const redisMock = {
        hget: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
        hset: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
        hincrby: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
        expire: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
      }

      jest.doMock('@upstash/redis', () => ({
        Redis: jest.fn().mockImplementation(() => redisMock),
      }))

      // First request should succeed (fallback to in-memory)
      const response1 = await POST(
        new Request('https://calendarvlu.test/api/extension/google/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'x-forwarded-for': '127.0.0.1',
          },
        }),
      )

      expect(response1.status).toBe(200)

      // Should not crash when Redis fails
      expect(redisMock.hget).toHaveBeenCalled()
    })
  })

  describe('sliding window behavior', () => {
    it('resets counters after window expires', async () => {
      const redisMock = {
        hget: jest.fn(),
        hset: jest.fn(),
        hincrby: jest.fn(),
        expire: jest.fn(),
      }

      jest.doMock('@upstash/redis', () => ({
        Redis: jest.fn().mockImplementation(() => redisMock),
      }))

      // First, simulate expired window (no existing counter)
      redisMock.hget.mockResolvedValue(null)
      redisMock.hset.mockResolvedValue('OK')
      redisMock.hincrby.mockResolvedValue(1)
      redisMock.expire.mockResolvedValue(1)

      const response = await POST(
        new Request('https://calendarvlu.test/api/extension/google/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'x-forwarded-for': '127.0.0.1',
          },
        }),
      )

      expect(response.status).toBe(200)

      // Verify new counter was created
      expect(redisMock.hset).toHaveBeenCalledWith(
        expect.stringContaining('rate_limit:'),
        expect.objectContaining({
          count: 1,
          windowStart: expect.any(Number),
        }),
      )
    })
  })

  describe('different client keys are isolated', () => {
    it('maintains separate counters for different clients', async () => {
      const redisMock = {
        hget: jest.fn(),
        hset: jest.fn(),
        hincrby: jest.fn(),
        expire: jest.fn(),
      }

      jest.doMock('@upstash/redis', () => ({
        Redis: jest.fn().mockImplementation(() => redisMock),
      }))

      redisMock.hget.mockResolvedValue(null)
      redisMock.hset.mockResolvedValue('OK')
      redisMock.hincrby.mockResolvedValue(1)
      redisMock.expire.mockResolvedValue(1)

      // Client 1 makes request
      await POST(
        new Request('https://calendarvlu.test/api/extension/google/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'x-forwarded-for': '192.168.1.1',
          },
        }),
      )

      // Client 2 makes request (should have separate counter)
      await POST(
        new Request('https://calendarvlu.test/api/extension/google/calendars', {
          method: 'POST',
          headers: {
            origin: 'https://calendarvlu.test',
            'x-forwarded-for': '192.168.1.2',
          },
        }),
      )

      // Should have created 2 separate keys
      expect(redisMock.hset).toHaveBeenCalledTimes(2)
      expect(redisMock.hincrby).toHaveBeenCalledTimes(2)
    })
  })
})
