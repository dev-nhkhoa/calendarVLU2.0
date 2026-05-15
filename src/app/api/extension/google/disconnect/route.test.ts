import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resetExtensionRateLimitsForTests } from '@/services/extension-api'
import { POST } from './route'

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    account: { updateMany: jest.fn() },
  },
}))

describe('POST /api/extension/google/disconnect', () => {
  beforeEach(() => {
    resetExtensionRateLimitsForTests()
    process.env.EXTENSION_ALLOWED_ORIGINS = 'https://calendarvlu.test'
    jest.mocked(auth).mockReset()
    jest.mocked(prisma.user.findUnique).mockReset()
    jest.mocked(prisma.account.updateMany).mockReset()
  })

  it('requires an authenticated session before disconnecting', async () => {
    jest.mocked(auth).mockResolvedValue(null)

    const response = await POST(new Request('https://calendarvlu.test/api/extension/google/disconnect', { method: 'POST', headers: { origin: 'https://calendarvlu.test' } }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'GOOGLE_NOT_CONNECTED' } })
    expect(prisma.account.updateMany).not.toHaveBeenCalled()
  })

  it('nullifies google tokens and preserves session', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1', email: 'test@test.com' } as any)
    jest.mocked(prisma.account.updateMany).mockResolvedValue({ count: 1 })

    const response = await POST(new Request('https://calendarvlu.test/api/extension/google/disconnect', { method: 'POST', headers: { origin: 'https://calendarvlu.test' } }))

    expect(response.status).toBe(200)
    expect(prisma.account.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', provider: 'google' },
      data: { access_token: null, refresh_token: null },
    })
    await expect(response.json()).resolves.toMatchObject({ ok: true, disconnected: true })
  })
})
