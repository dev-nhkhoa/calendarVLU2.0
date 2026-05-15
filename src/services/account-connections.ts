import type { Account } from '@prisma/client'

export function toAccountConnection(account: Account) {
  return {
    provider: account.provider,
    connected: Boolean(account.access_token || account.refresh_token || account.providerAccountId),
    expiresAt: account.expires_at,
    scope: account.scope,
  }
}
