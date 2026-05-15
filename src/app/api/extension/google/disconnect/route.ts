import { signOut } from '@/auth'
import { extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError } from '@/services/extension-api'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function POST(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    await signOut({ redirect: false })
    return extensionJson({ ok: true, disconnected: true }, undefined, request)
  } catch (error) {
    return mapUnknownError(error, guard.requestId, request)
  }
}
