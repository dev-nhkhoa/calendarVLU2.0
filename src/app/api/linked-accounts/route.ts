'use server'

import { getUserByEmail, deleteAccount, createAccount } from '@/actions/auth'
import { Account } from '@prisma/client'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) return new Response('Email is required', { status: 400 })

  const user = await getUserByEmail(email)
  if (!user) return new Response('User not found', { status: 404 })

  return new Response(JSON.stringify(user.accounts), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  const { account, userEmail } = await req.json()

  if (!account || !userEmail) return new Response('Missing email, provider or providerId', { status: 400 })

  const user = await getUserByEmail(userEmail)
  if (!user) return new Response('User not found', { status: 404 })

  const response = await createAccount(account as Account, userEmail as string)

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function DELETE(req: NextRequest) {
  const account: Account = await req.json()

  if (!account) return new Response('Missing Account Information', { status: 400 })

  const deleted = await deleteAccount(account.id)

  if (!deleted) return new Response('Account not found', { status: 404 })

  return new Response('Account deleted', { status: 200 })
}
