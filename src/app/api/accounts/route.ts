import { createAccount, deleteAccount, getUserByEmail } from '@/actions/auth'
import { auth } from '@/auth'
import { Account } from '@prisma/client'
import { NextRequest } from 'next/server'

/**
 *
 * @export
 * @param {NextRequest} req
 * @return {*}
 *
 */

export async function GET() {
  const checkAuth = await auth()

  if (!checkAuth) return Response.json({ error: 'Unauthorized!' }, { status: 401 })

  const email = checkAuth?.user?.email

  if (!email) return Response.json({ error: 'Missing Email!' }, { status: 400 })

  const user = await getUserByEmail(email)
  if (!user) return Response.json({ error: 'User not found!' }, { status: 404 })

  return Response.json(user.accounts, { status: 200 })
}

export async function POST(req: NextRequest) {
  const checkAuth = await auth()

  if (!checkAuth) return Response.json({ error: 'Unauthorized!' }, { status: 401 })

  const { account } = await req.json()

  if (!account) return Response.json({ error: 'Missing Account!' }, { status: 400 })

  const email = checkAuth?.user?.email

  if (!email) return Response.json({ error: 'Missing Email!' }, { status: 400 })

  const user = await getUserByEmail(email)
  if (!user) return Response.json({ error: 'User not found!' }, { status: 404 })

  const createdAccount = await createAccount(account as Account, email)

  if (!createdAccount) return Response.json({ error: 'Failed when creating an Account!' }, { status: 400 })

  return Response.json(createdAccount, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const checkAuth = await auth()

  if (!checkAuth) return Response.json({ error: 'Unauthorized!' }, { status: 401 })

  const { provider } = await req.json()

  if (!provider) return new Response('Missing Provider!', { status: 400 })

  const email = checkAuth?.user?.email

  if (!email) return Response.json({ error: 'Missing Email!' }, { status: 400 })

  const user = await getUserByEmail(email)
  if (!user) return Response.json({ error: 'User not found!' }, { status: 404 })

  const deletedAccount = await deleteAccount(provider, user.id)

  if (!deletedAccount) return Response.json({ error: 'Failed to delete an account' }, { status: 404 })

  return Response.json(deletedAccount, { status: 204 })
}
