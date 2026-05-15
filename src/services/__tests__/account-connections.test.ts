import type { Account } from '@prisma/client'
import { toAccountConnection } from '../account-connections'

function buildAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'account-id',
    userId: 'user-id',
    type: 'oauth',
    provider: 'google',
    providerAccountId: 'provider-account-id',
    refresh_token: 'refresh-token-secret',
    access_token: 'access-token-secret',
    expires_at: 1234567890,
    token_type: 'Bearer',
    scope: 'openid email calendar.events',
    id_token: 'id-token-secret',
    session_state: 'session-state-secret',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('toAccountConnection', () => {
  it('returns only sanitized provider connection fields', () => {
    const connection = toAccountConnection(buildAccount())

    expect(connection).toEqual({
      provider: 'google',
      connected: true,
      expiresAt: 1234567890,
      scope: 'openid email calendar.events',
    })
    expect(JSON.stringify(connection)).not.toContain('access-token-secret')
    expect(JSON.stringify(connection)).not.toContain('refresh-token-secret')
    expect(JSON.stringify(connection)).not.toContain('id-token-secret')
    expect(connection).not.toHaveProperty('access_token')
    expect(connection).not.toHaveProperty('refresh_token')
    expect(connection).not.toHaveProperty('id_token')
    expect(connection).not.toHaveProperty('session_state')
  })
})
