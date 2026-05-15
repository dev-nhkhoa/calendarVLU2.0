import { deleteAccount, getUserByEmail } from '@/actions/auth'
import { auth } from '@/auth'
import { NextRequest } from 'next/server'

export async function GET() {
  const checkAuth = await auth()

  if (!checkAuth) return Response.json({ error: 'Unauthorized!' }, { status: 401 })

  const email = checkAuth?.user?.email

  if (!email) return Response.json({ error: 'Missing Email!' }, { status: 400 })

  const user = await getUserByEmail(email)
  if (!user) return Response.json({ error: 'User not found!' }, { status: 404 })

  return Response.json(user.accounts, { status: 200 })
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

  return Response.json(deletedAccount, { status: 200 })
}
