'use server'

import { NextRequest } from 'next/server'

/**
 * Handles the POST request to update the VLU cookie.
 *
 * @export
 * @return {*}
 */
export async function POST(req: NextRequest) {
  const { id, password } = await req.json()

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/accounts/vlu?id=${id}&password=${password}`)

  if (!response.ok) return Response.json({ error: 'Failed to fetch VLU' }, { status: 500 })

  const newCookie = await response.json()

  return Response.json(newCookie, { status: 201 })
}
