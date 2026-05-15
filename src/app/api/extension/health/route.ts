import { extensionJson, handleOptionsRequest } from '@/services/extension-api'
import { getFailureCounters } from '@/services/audit-logger'

export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request)
}

export async function GET(request: Request) {
  const counters = getFailureCounters()

  const status = counters.vluFetchFailures > 5 || counters.parserFailures > 5 ? 'degraded' : 'healthy'

  return extensionJson({
    ok: true,
    status,
    version: process.env.npm_package_version ?? '2.0.0',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    diagnostics: {
      failures: counters,
    },
  }, undefined, request)
}

export async function POST(request: Request) {
  return extensionJson({
    ok: false,
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for health check.' },
  }, { status: 405 }, request)
}
