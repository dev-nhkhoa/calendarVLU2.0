import { z } from 'zod'

export const extensionErrorCodeSchema = z.enum([
  'BAD_REQUEST',
  'ORIGIN_NOT_ALLOWED',
  'COOKIE_MISSING',
  'COOKIE_EXPIRED',
  'VLU_UNAVAILABLE',
  'PARSER_FAILED',
  'GOOGLE_NOT_CONNECTED',
  'GOOGLE_TOKEN_INVALID',
  'GOOGLE_PERMISSION_DENIED',
  'OUTLOOK_NOT_CONNECTED',
  'OUTLOOK_TOKEN_INVALID',
  'OUTLOOK_PERMISSION_DENIED',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
])

export type ExtensionErrorCode = z.infer<typeof extensionErrorCodeSchema>

export interface ExtensionApiGuardOptions {
  maxBodyBytes?: number
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  requireOrigin?: boolean
}

const FALLBACK_CORS_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export function extensionJson(data: unknown, init?: ResponseInit, request?: Request) {
  const origin = request?.headers.get('origin') ?? null
  const corsOrigin = resolveCorsOrigin(origin, request)

  return Response.json(data, {
    ...init,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CalendarVLU-Client, X-CalendarVLU-Request-Id',
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  })
}

export function handleOptionsRequest(request: Request) {
  const origin = request.headers.get('origin') ?? null
  const corsOrigin = resolveCorsOrigin(origin, request)

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CalendarVLU-Client, X-CalendarVLU-Request-Id',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    },
  })
}

export function extensionError(code: ExtensionErrorCode, message: string, status: number, requestId?: string, details: Record<string, unknown> = {}, request?: Request) {
  return extensionJson(
    {
      ok: false,
      error: {
        code,
        message,
        retryable: status >= 500 || status === 429,
        requestId,
        details,
      },
    },
    { status },
    request,
  )
}

export function resolveCorsOrigin(originHeader: string | null, request?: Request): string {
  if (originHeader && isAllowedOrigin(originHeader)) return originHeader
  if (originHeader) return 'null'
  if (request && isExtensionClient(request)) return 'null'
  return getAllowedOrigins()[0] ?? FALLBACK_CORS_ORIGIN
}

function getRequestId(request: Request) {
  return request.headers.get('x-calendarvlu-request-id') ?? crypto.randomUUID()
}

export function getAllowedOrigins() {
  return (process.env.EXTENSION_ALLOWED_ORIGINS ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function isAllowedOrigin(origin: string | null) {
  if (!origin) return false

  return getAllowedOrigins().includes(origin)
}

export function isExtensionClient(request: Request) {
  return request.headers.get('X-CalendarVLU-Client') === 'extension'
}

export function getClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || request.headers.get('origin') || 'unknown'
}

export async function checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const { checkRateLimit: rlCheck } = await import('./rate-limiter')
  return rlCheck(key, maxRequests, windowMs)
}

export async function resetExtensionRateLimitsForTests() {
  const { resetRateLimitsForTests } = await import('./rate-limiter')
  resetRateLimitsForTests()
}

export async function readLimitedJson(request: Request, maxBodyBytes = 64 * 1024) {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > maxBodyBytes) {
    throw new Error('REQUEST_TOO_LARGE')
  }

  const text = await request.text()
  if (new TextEncoder().encode(text).length > maxBodyBytes) {
    throw new Error('REQUEST_TOO_LARGE')
  }

  if (!text) return {}
  return JSON.parse(text)
}

export async function guardExtensionRequest(request: Request, options: ExtensionApiGuardOptions = {}) {
  const requestId = getRequestId(request)
  const origin = request.headers.get('origin')

  if (options.requireOrigin !== false && !isAllowedOrigin(origin)) {
    return { ok: false as const, response: extensionError('ORIGIN_NOT_ALLOWED', 'Origin is not allowed.', 403, requestId, {}, request) }
  }

  const rateLimit = options.rateLimit ?? { maxRequests: 60, windowMs: 60_000 }
  if (!(await checkRateLimit(getClientKey(request), rateLimit.maxRequests, rateLimit.windowMs))) {
    return { ok: false as const, response: extensionError('RATE_LIMITED', 'Too many requests. Try again later.', 429, requestId, {}, request) }
  }

  return { ok: true as const, requestId }
}

export function mapUnknownError(error: unknown, requestId?: string, request?: Request) {
  if (error instanceof SyntaxError) return extensionError('BAD_REQUEST', 'Invalid JSON request body.', 400, requestId, {}, request)
  if (error instanceof Error && error.message === 'REQUEST_TOO_LARGE') return extensionError('BAD_REQUEST', 'Request body is too large.', 413, requestId, {}, request)

  return extensionError('INTERNAL_ERROR', 'Unexpected server error.', 500, requestId, {}, request)
}
