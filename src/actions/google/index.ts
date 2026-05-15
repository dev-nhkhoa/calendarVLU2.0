'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Account } from '@prisma/client'
import { getUserByEmail } from '../auth'

export async function getAccessToken(): Promise<string | null> {
  const session = await auth()

  if (!session?.user?.email) {
    console.warn('[GoogleAuth] Cannot resolve access token: missing authenticated session')
    return null
  }

  const user = await getUserByEmail(session.user.email)

  const googleAccount = selectGoogleAccount(user?.accounts ?? [])

  if (!googleAccount) {
    console.warn('[GoogleAuth] Cannot resolve access token: no Google account linked')
    return null
  }

  if (!googleAccount.access_token) {
    console.warn('[GoogleAuth] Cannot resolve access token: Google account has no access token')
    return null
  }

  const expiresAtMs = googleAccount.expires_at ? googleAccount.expires_at * 1000 : null
  const refreshSkewMs = 60_000

  if (!expiresAtMs || expiresAtMs > Date.now() + refreshSkewMs) return googleAccount.access_token

  if (!googleAccount.refresh_token) {
    console.warn('[GoogleAuth] Cannot refresh expired Google token: missing refresh token')
    return null
  }

  console.info('[GoogleAuth] Refreshing expired Google access token')
  const refreshResult = await refreshAccessToken(googleAccount.refresh_token as string)

  if (!refreshResult.access_token) {
    console.warn('[GoogleAuth] Failed to refresh Google access token', { error: refreshResult.error })
    if (isReconnectRequiredOAuthError(refreshResult.error)) {
      await clearGoogleTokens(googleAccount.id)
    }
    return null
  }

  const updatedAccount = await updateAccessToken(
    googleAccount.id,
    refreshResult.access_token,
    typeof refreshResult.expires_in === 'number' ? Math.floor(Date.now() / 1000) + refreshResult.expires_in : undefined,
  )

  if (!updatedAccount) return null

  return updatedAccount.access_token
}

function selectGoogleAccount(accounts: Account[]) {
  return accounts
    .filter((account) => account.provider === 'google' && account.access_token)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]
}

function isReconnectRequiredOAuthError(error: unknown) {
  return error === 'invalid_grant' || error === 'unauthorized_client'
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const body = new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      return { error: data.error || 'refresh_failed', error_description: data.error_description || 'Failed to refresh token' }
    }

    return data
  } catch (error) {
    return { error: 'RefreshAccessTokenError', error_description: String(error) }
  }
}

export async function updateAccessToken(accountId: string, accessToken: string, expiresAt?: number) {
  return await prisma.account.update({
    where: { id: accountId },
    data: { access_token: accessToken, ...(expiresAt ? { expires_at: expiresAt } : {}) },
  })
}

async function clearGoogleTokens(accountId: string) {
  await prisma.account.update({
    where: { id: accountId },
    data: {
      access_token: null,
      refresh_token: null,
      expires_at: null,
    },
  })
}
