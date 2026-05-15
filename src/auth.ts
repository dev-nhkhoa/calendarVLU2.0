import NextAuth, { type NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const microsoftTenantId = process.env.AUTH_MICROSOFT_TENANT_ID || 'common'
type AuthEvents = NonNullable<NextAuthConfig['events']>
type SignInEvent = NonNullable<AuthEvents['signIn']>
type ProviderAccount = Parameters<SignInEvent>[0]['account']

export const authConfig = {
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      await persistProviderTokens(user.id, account)

      console.info('[Auth][signIn]', {
        provider: account?.provider,
        userId: user.id,
        email: user.email,
        isNewUser,
        hasAccessToken: Boolean(account?.['access_token']),
        hasRefreshToken: Boolean(account?.['refresh_token']),
        scope: account?.scope,
        expiresAt: account?.expires_at,
      })
    },
    async linkAccount({ user, account }) {
      await persistProviderTokens(user.id, account)

      console.info('[Auth][linkAccount]', {
        provider: account.provider,
        userId: user.id,
        email: user.email,
        providerAccountId: account.providerAccountId,
        hasAccessToken: Boolean(account['access_token']),
        hasRefreshToken: Boolean(account['refresh_token']),
        scope: account.scope,
        expiresAt: account.expires_at,
      })
    },
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      },
    },
  },
  providers: [
    Google({
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_SECRET!,
      issuer: `https://login.microsoftonline.com/${microsoftTenantId}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read Calendars.ReadWrite offline_access',
        },
      },
    }),
  ],
} satisfies NextAuthConfig

async function persistProviderTokens(userId: string | undefined, account: ProviderAccount) {
  if (!userId || !account?.provider || !account.providerAccountId) return

  const data: Prisma.AccountUpdateManyMutationInput = {}

  if (typeof account['access_token'] === 'string') data.access_token = account['access_token']
  if (typeof account['refresh_token'] === 'string') data.refresh_token = account['refresh_token']
  if (typeof account.expires_at === 'number') data.expires_at = account.expires_at
  if (typeof account.token_type === 'string') data.token_type = account.token_type
  if (typeof account.scope === 'string') data.scope = account.scope
  if (typeof account.id_token === 'string') data.id_token = account.id_token
  if (typeof account.session_state === 'string') data.session_state = account.session_state

  if (!Object.keys(data).length) return

  const result = await prisma.account.updateMany({
    where: {
      userId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    },
    data,
  })

  console.info('[Auth][persistProviderTokens]', {
    provider: account.provider,
    userId,
    providerAccountId: account.providerAccountId,
    updatedCount: result.count,
    hasAccessToken: Boolean(account['access_token']),
    hasRefreshToken: Boolean(account['refresh_token']),
    expiresAt: account.expires_at,
  })
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
