'use server'

import { getUserByEmail, updateAccount } from '@/actions/auth'
import { auth } from '@/auth'

/**
 * Handles the POST request to update the VLU cookie.
 *
 * @export
 * @return {*}
 */
export async function POST() {
  const checkAuth = await auth()

  if (!checkAuth) return Response.json({ error: 'Unauthorized!' }, { status: 401 })

  const email = checkAuth?.user?.email

  if (!email) return Response.json({ error: 'Missing Email!' }, { status: 400 })

  const user = await getUserByEmail(email)

  if (!user) return Response.json({ error: 'User not found!' }, { status: 404 })

  const vluAccount = user.accounts.find((account) => account.provider === 'vanLang')

  if (!vluAccount) return Response.json({ error: 'VLU account not found!' }, { status: 404 })

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/accounts/vlu?id=${vluAccount?.student_id}&password=${vluAccount?.password}`)

  if (!response.ok) return Response.json({ error: 'Failed to fetch VLU' }, { status: 500 })

  const newCookie = await response.json()

  // update cookie to account
  const updatedCookie = await updateAccount(vluAccount.id, { access_token: newCookie })

  if (!updatedCookie) return new Response('Failed to update cookie', { status: 500 })

  return Response.json(newCookie, { status: 201 })
}
