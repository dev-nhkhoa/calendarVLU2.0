'use server'

import { NextRequest } from 'next/server'
import { deprecatedVluPasswordFlowHeaders } from '@/services/deprecation'

/**
 * Handles the POST request to update the VLU cookie.
 *
 * @export
 * @return {*}
 */
export async function POST(req: NextRequest) {
  const { id, password } = await req.json()

  // Get the base URL from the request headers
  const protocol = req.headers.get('x-forwarded-proto') || 'http'
  const host = req.headers.get('host')
  const baseUrl = `${protocol}://${host}`

  const response = await fetch(`${baseUrl}/api/accounts/vlu?id=${id}&password=${password}`)

  if (!response.ok) {
    console.error('Failed to fetch VLU cookie:', await response.text())
    return Response.json({ error: 'Failed to fetch VLU' }, { status: 500, headers: deprecatedVluPasswordFlowHeaders })
  }

  const newCookie = await response.json()

  return Response.json(newCookie, { status: 201, headers: deprecatedVluPasswordFlowHeaders })
}
