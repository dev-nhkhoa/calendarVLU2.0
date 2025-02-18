'use server'

import { getAccount, updateAccount } from '@/actions/auth'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { accountId } = await req.json()

  if (!accountId) return new Response('Account ID not found!', { status: 400 })

  const account = await getAccount(accountId)

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/check-vlu-account?id=${account?.student_id}&password=${account?.password}`)

  if (!response.ok) return new Response('Failed to login to VLU', { status: 500 })

  const newCookie = await response.json()

  // update cookie to account
  const updatedCookie = await updateAccount(accountId, { access_token: newCookie })

  if (!updatedCookie) return new Response('Failed to update cookie', { status: 500 })

  return new Response(JSON.stringify(newCookie), { status: 200 })
}
