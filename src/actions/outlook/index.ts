'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Account } from '@prisma/client'
import { getUserByEmail } from '../auth'

export async function getOutlookAccessToken(): Promise<string | null> {
  const session = await auth()
  if (!session) return null

  const user = await getUserByEmail(session?.user?.email as string)
  const msAccount = user?.accounts.filter((account: Account) => account.provider === 'microsoft-entra-id')[0]
  if (!msAccount) return null

  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${msAccount.access_token}` },
  })

  if (!response.ok) {
    const refreshed = await refreshOutlookAccessToken(msAccount.refresh_token as string)
    if (refreshed.error) return null

    const updated = await updateOutlookAccessToken(msAccount.id, refreshed.access_token, refreshed.refresh_token, refreshed.expires_in)
    if (!updated) return null
    return updated.access_token
  }

  return msAccount.access_token
}

export async function refreshOutlookAccessToken(refreshToken: string) {
  try {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.AUTH_MICROSOFT_ID!,
        client_secret: process.env.AUTH_MICROSOFT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: 'User.Read Calendars.ReadWrite offline_access',
      }),
    })
    return await response.json()
  } catch (error) {
    return { error: 'RefreshAccessTokenError' + error }
  }
}

export async function updateOutlookAccessToken(accountId: string, accessToken: string, refreshToken?: string, expiresIn?: number) {
  const data: Record<string, string | number> = { access_token: accessToken }
  if (refreshToken) data.refresh_token = refreshToken
  if (expiresIn) data.expires_at = Math.floor(Date.now() / 1000) + expiresIn

  return await prisma.account.update({
    where: { id: accountId },
    data,
  })
}
