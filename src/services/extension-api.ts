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
  'RATE_LIMITED',
  'INTERNAL_ERROR',
])

export type ExtensionErrorCode = z.infer<typeof extensionErrorCodeSchema>

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>()

export interface ExtensionApiGuardOptions {
  maxBodyBytes?: number
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  requireOrigin?: boolean
}

export function extensionJson(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  })
}

export function extensionError(code: ExtensionErrorCode, message: string, status: number, requestId?: string, details: Record<string, unknown> = {}) {
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
  )
}

export function getRequestId(request: Request) {
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

  if (origin.startsWith('chrome-extension://')) return true

  return getAllowedOrigins().includes(origin)
}

export function getClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || request.headers.get('origin') || 'unknown'
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const current = rateLimitBuckets.get(key)

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) return false

  current.count += 1
  return true
}

export function resetExtensionRateLimitsForTests() {
  rateLimitBuckets.clear()
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

export function guardExtensionRequest(request: Request, options: ExtensionApiGuardOptions = {}) {
  const requestId = getRequestId(request)
  const origin = request.headers.get('origin')

  if (options.requireOrigin !== false && !isAllowedOrigin(origin)) {
    return { ok: false as const, response: extensionError('ORIGIN_NOT_ALLOWED', 'Origin is not allowed.', 403, requestId) }
  }

  const rateLimit = options.rateLimit ?? { maxRequests: 60, windowMs: 60_000 }
  if (!checkRateLimit(getClientKey(request), rateLimit.maxRequests, rateLimit.windowMs)) {
    return { ok: false as const, response: extensionError('RATE_LIMITED', 'Too many requests. Try again later.', 429, requestId) }
  }

  return { ok: true as const, requestId }
}

export function mapUnknownError(error: unknown, requestId?: string) {
  if (error instanceof SyntaxError) return extensionError('BAD_REQUEST', 'Invalid JSON request body.', 400, requestId)
  if (error instanceof Error && error.message === 'REQUEST_TOO_LARGE') return extensionError('BAD_REQUEST', 'Request body is too large.', 413, requestId)

  return extensionError('INTERNAL_ERROR', 'Unexpected server error.', 500, requestId)
}
