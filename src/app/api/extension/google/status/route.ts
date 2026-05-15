import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError } from '@/services/extension-api'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function GET(request: Request) {
  const guard = await guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const session = await auth()
    console.info('[Extension Google status] Session resolved', {
      requestId: guard.requestId,
      hasSession: Boolean(session),
      hasUser: Boolean(session?.user),
      hasEmail: Boolean(session?.user?.email),
      email: session?.user?.email ?? null,
      origin: request.headers.get('origin'),
      client: request.headers.get('x-calendarvlu-client'),
      cookieHeaderPresent: Boolean(request.headers.get('cookie')),
    })

    if (!session?.user?.email) {
      console.info('[Extension Google status] Not connected because session email is missing', {
        requestId: guard.requestId,
      })
      return extensionJson({ ok: true, connected: false, signInUrl: '/auth/sign-in?callbackUrl=/' }, undefined, request)
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: { where: { provider: 'google' }, orderBy: { updatedAt: 'desc' } } },
    })

    const googleAccount = user?.accounts?.find((account) => account.access_token) ?? null
    const connected = Boolean(googleAccount?.access_token)
    console.info('[Extension Google status] Google account lookup complete', {
      requestId: guard.requestId,
      userFound: Boolean(user),
      googleAccountCount: user?.accounts.length ?? 0,
      googleAccounts: user?.accounts.map((account) => ({
        id: account.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        hasAccessToken: Boolean(account.access_token),
        hasRefreshToken: Boolean(account.refresh_token),
        expiresAt: account.expires_at,
        updatedAt: account.updatedAt,
      })) ?? [],
      connected,
    })

    return extensionJson({
      ok: true,
      connected,
      signInUrl: connected ? null : '/auth/sign-in?callbackUrl=/',
    }, undefined, request)
  } catch (error) {
    return mapUnknownError(error, guard.requestId, request)
  }
}
