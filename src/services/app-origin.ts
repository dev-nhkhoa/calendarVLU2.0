import type { NextRequest } from 'next/server'

function normalizeOrigin(origin: string) {
  return origin.trim()
}

function getConfiguredAppOrigins() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
}

export function getAllowedAppOrigins(request: NextRequest) {
  const requestOrigin = new URL(request.url).origin
  return Array.from(new Set([requestOrigin, ...getConfiguredAppOrigins()]))
}

export function isAllowedAppOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  return getAllowedAppOrigins(request).includes(origin)
}

export function resolveAppCorsOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = getAllowedAppOrigins(request)

  if (origin && allowedOrigins.includes(origin)) return origin
  return allowedOrigins[0]
}
