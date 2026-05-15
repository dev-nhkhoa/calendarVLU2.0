import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { extensionError, extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError } from '@/services/extension-api'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function POST(request: Request) {
  const guard = await guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const session = await auth()
    if (!session?.user?.email) return extensionError('OUTLOOK_NOT_CONNECTED', 'Sign in before disconnecting Outlook Calendar.', 401, guard.requestId, {}, request)

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return extensionError('OUTLOOK_NOT_CONNECTED', 'User not found.', 401, guard.requestId, {}, request)

    await prisma.account.updateMany({
      where: { userId: user.id, provider: 'microsoft-entra-id' },
      data: { access_token: null, refresh_token: null },
    })

    return extensionJson({ ok: true, disconnected: true }, undefined, request)
  } catch (error) {
    return mapUnknownError(error, guard.requestId, request)
  }
}
