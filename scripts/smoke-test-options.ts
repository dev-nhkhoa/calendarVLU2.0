#!/usr/bin/env node

/**
 * Smoke test script for API OPTIONS preflight validation
 * Tests all extension API endpoints return proper CORS headers
 */

const endpoints = [
  '/api/extension/health',
  '/api/extension/google/calendars',
  '/api/extension/google/import',
  '/api/extension/google/disconnect',
  '/api/extension/outlook/disconnect',
  '/api/extension/vlu/calendars',
  '/api/extension/vlu/check-session',
  '/api/extension/calendar/export-csv',
  '/api/extension/calendar/export-ical',
]

const allowedOrigin = 'https://calendarvlu.test'

async function testOptionsPreflight(endpoint: string) {
  const url = `https://calendarvlu.test${endpoint}`

  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        origin: allowedOrigin,
      },
    })

    // Check status
    if (response.status !== 204) {
      throw new Error(`Expected 204, got ${response.status}`)
    }

    // Check CORS headers
    const allowOrigin = response.headers.get('access-control-allow-origin')
    const allowMethods = response.headers.get('access-control-allow-methods')
    const allowHeaders = response.headers.get('access-control-allow-headers')
    const allowCredentials = response.headers.get('access-control-allow-credentials')

    if (allowOrigin !== allowedOrigin) {
      throw new Error(`Expected allow-origin "${allowedOrigin}", got "${allowOrigin}"`)
    }

    if (!allowMethods || !allowMethods.includes('OPTIONS')) {
      throw new Error(`OPTIONS not in allow-methods: "${allowMethods}"`)
    }

    if (!allowHeaders || !allowHeaders.includes('Content-Type')) {
      throw new Error(`Content-Type not in allow-headers: "${allowHeaders}"`)
    }

    if (allowCredentials !== 'true') {
      throw new Error(`Expected allow-credentials "true", got "${allowCredentials}"`)
    }

    console.log(`✅ ${endpoint} - CORS headers OK`)
    return true
  } catch (error) {
    console.error(`❌ ${endpoint} - ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Running OPTIONS preflight smoke tests...\n')

  let passed = 0
  let failed = 0

  for (const endpoint of endpoints) {
    const success = await testOptionsPreflight(endpoint)
    if (success) {
      passed++
    } else {
      failed++
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)

  if (failed > 0) {
    console.error('❌ Some endpoints failed CORS validation')
    process.exit(1)
  } else {
    console.log('✅ All endpoints passed CORS validation')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('💥 Test runner failed:', error)
  process.exit(1)
})