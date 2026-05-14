import { handleOptionsRequest } from '@/services/extension-api'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}
