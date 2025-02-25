'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Account } from '@prisma/client'
import { getUserByEmail } from '../auth'

export async function getAccessToken(): Promise<string | null> {
  const session = await auth()

  if (!session) return null

  const user = await getUserByEmail(session?.user?.email as string)

  const googleAccount = user?.accounts.filter((account: Account) => account.provider === 'google')[0]

  if (!googleAccount) return null

  // kiểm tra xem có lấy được data hay không
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    headers: { Authorization: `Bearer ${googleAccount.access_token}` },
  })

  // if response is not ok, need to refress token
  if (!response.ok) {
    console.log('cookie expired, need to refresh token')
    const fetchRefreshToken = await refreshAccessToken(googleAccount.refresh_token as string)
    const updatedAccessToken = await updateAccessToken(googleAccount.id, fetchRefreshToken.access_token)

    if (!updatedAccessToken) return null

    return updatedAccessToken.access_token
  }

  return googleAccount.access_token
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    return await response.json()
  } catch (error) {
    return { error: 'RefreshAccessTokenError' + error }
  }
}

export async function updateAccessToken(accountId: string, accessToken: string) {
  return await prisma.account.update({
    where: { id: accountId },
    data: { access_token: accessToken },
  })
}
