import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { extensionJson, guardExtensionRequest, mapUnknownError } from '@/services/extension-api'

export async function GET(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const session = await auth()
    if (!session?.user?.email) {
      return extensionJson({ ok: true, connected: false, signInUrl: '/auth/sign-in?callbackUrl=/' }, undefined, request)
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: { where: { provider: 'google' } } },
    })

    const googleAccount = user?.accounts?.[0] ?? null
    const connected = Boolean(googleAccount?.access_token)

    return extensionJson({
      ok: true,
      connected,
      signInUrl: connected ? null : '/auth/sign-in?callbackUrl=/',
    }, undefined, request)
  } catch (error) {
    return mapUnknownError(error, guard.requestId, request)
  }
}
