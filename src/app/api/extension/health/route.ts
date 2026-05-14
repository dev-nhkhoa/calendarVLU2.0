import { extensionJson } from '@/services/extension-api'

export async function GET() {
  return extensionJson({
    ok: true,
    status: 'healthy',
    version: process.env.npm_package_version ?? '2.0.0',
    time: new Date().toISOString(),
  })
}
