import { getOutlookAccessToken } from '@/actions/outlook'
import { extensionJson, guardExtensionRequest, handleOptionsRequest, mapUnknownError } from '@/services/extension-api'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function GET(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const accessToken = await getOutlookAccessToken()

    return extensionJson({
      ok: true,
      connected: Boolean(accessToken),
      signInUrl: accessToken ? null : '/auth/sign-in?callbackUrl=/',
    }, undefined, request)
  } catch (error) {
    return mapUnknownError(error, guard.requestId, request)
  }
}
