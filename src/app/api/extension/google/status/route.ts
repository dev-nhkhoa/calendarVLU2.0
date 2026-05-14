import { getAccessToken } from '@/actions/google'
import { extensionJson, guardExtensionRequest, mapUnknownError } from '@/services/extension-api'

export async function GET(request: Request) {
  const guard = guardExtensionRequest(request)
  if (!guard.ok) return guard.response

  try {
    const accessToken = await getAccessToken()

    return extensionJson({
      ok: true,
      connected: Boolean(accessToken),
      signInUrl: accessToken ? null : '/auth/sign-in?callbackUrl=/',
    })
  } catch (error) {
    return mapUnknownError(error, guard.requestId)
  }
}
