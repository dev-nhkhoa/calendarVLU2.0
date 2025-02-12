import { getAllUserAccounts, getUserByEmail } from '@/actions/auth'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) return new Response('Email is required', { status: 400 })

  const user = await getUserByEmail(email)
  if (!user) return new Response('User not found', { status: 404 })

  const accounts = await getAllUserAccounts(user.id)

  return new Response(JSON.stringify(accounts), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
