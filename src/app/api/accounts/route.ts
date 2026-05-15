import { deleteAccount, getUserByEmail } from '@/actions/auth'
import { auth } from '@/auth'
import { toAccountConnection } from '@/services/account-connections'
import { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  // Same-origin requests (no Origin header) are always allowed
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeaders(req) })
}

export async function GET(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: corsHeaders(req) })
  }

  const checkAuth = await auth()

  if (!checkAuth) return Response.json({ error: 'Unauthorized!' }, { status: 401, headers: corsHeaders(req) })

  const email = checkAuth?.user?.email

  if (!email) return Response.json({ error: 'Missing Email!' }, { status: 400, headers: corsHeaders(req) })

  const user = await getUserByEmail(email)
  if (!user) return Response.json({ error: 'User not found!' }, { status: 404, headers: corsHeaders(req) })

  return Response.json(user.accounts.map(toAccountConnection), { status: 200, headers: corsHeaders(req) })
}

export async function DELETE(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: corsHeaders(req) })
  }

  const contentType = req.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return Response.json({ error: 'Content-Type must be application/json' }, { status: 400, headers: corsHeaders(req) })
  }

  const checkAuth = await auth()

  if (!checkAuth) return Response.json({ error: 'Unauthorized!' }, { status: 401, headers: corsHeaders(req) })

  const { provider } = await req.json()

  if (!provider) return new Response('Missing Provider!', { status: 400, headers: corsHeaders(req) })

  const email = checkAuth?.user?.email

  if (!email) return Response.json({ error: 'Missing Email!' }, { status: 400, headers: corsHeaders(req) })

  const user = await getUserByEmail(email)
  if (!user) return Response.json({ error: 'User not found!' }, { status: 404, headers: corsHeaders(req) })

  const deletedAccount = await deleteAccount(provider, user.id)

  if (!deletedAccount) return Response.json({ error: 'Failed to delete an account' }, { status: 404, headers: corsHeaders(req) })

  return Response.json(deletedAccount, { status: 200, headers: corsHeaders(req) })
}
