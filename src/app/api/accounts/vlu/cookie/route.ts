'use server'

import { getAccount, updateAccount } from '@/actions/auth'
import { NextRequest } from 'next/server'

/**
 * Handles the POST request to update the VLU cookie.
 *
 * @export
 * @return {*}
 */
export async function POST(req: NextRequest) {
  const { accountId } = await req.json()

  if (!accountId) return Response.json({ error: 'MissingAccountId!' }, { status: 400 })

  const account = await getAccount(accountId)

  if (!account) return Response.json({ error: 'Account not found!' }, { status: 404 })

  if (account.provider != 'vanLang') return Response.json({ error: 'Account is not VLU!' }, { status: 400 })

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/accounts/vlu?id=${account?.student_id}&password=${account?.password}`)

  if (!response.ok) return Response.json({ error: 'Failed to fetch VLU' }, { status: 500 })

  const newCookie = await response.json()

  // update cookie to account
  const updatedCookie = await updateAccount(account.id, { access_token: newCookie })

  if (!updatedCookie) return new Response('Failed to update cookie', { status: 500 })

  return Response.json(updatedCookie.access_token, { status: 201 })
}
