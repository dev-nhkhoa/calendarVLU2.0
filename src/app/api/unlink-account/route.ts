import { deleteAccount } from '@/actions/auth'
import { NextRequest } from 'next/server'

export async function DELETE(req: NextRequest) {
  const { email, provider } = Object.fromEntries(new URL(req.url).searchParams)

  if (!email || !provider) return new Response('Missing email or provider', { status: 400 })
  // Delete the account
  const deleted = await deleteAccount(email, provider)

  if (!deleted) return new Response('Account not found', { status: 404 })

  return new Response('Account deleted', { status: 200 })
}
