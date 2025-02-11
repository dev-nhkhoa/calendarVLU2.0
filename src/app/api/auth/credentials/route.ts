'use server'

import { NextRequest } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { addCredentialUser2DB, checkUserExist, getUser } from '@/actions/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { email, password, name } = body

  // check if email existed
  if (await checkUserExist(email)) return new Response('This email is already in use.', { status: 400 })

  // create new credential account
  const hassedPassword = await bcrypt.hash(password, 10)
  const credentialAccount = await addCredentialUser2DB({ hassedPassword, email, name })

  const user = await getUser(credentialAccount.userId)
  if (!user) return new Response('Failed to crete account!', { status: 500 })

  return new Response(JSON.stringify({ user }), { status: 302 })
}
