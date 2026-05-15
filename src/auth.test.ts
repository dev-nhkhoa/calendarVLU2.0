import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const authSource = readFileSync(join(__dirname, 'auth.ts'), 'utf8')

describe('auth configuration security', () => {
  it('does not register the passwordless credentials provider', () => {
    expect(authSource).not.toContain('next-auth/providers/credentials')
    expect(authSource).not.toContain('Credentials(')
    expect(authSource).not.toContain('userEmail')
  })

  it('does not copy provider access tokens into client-visible session callbacks', () => {
    expect(authSource).not.toContain('token.accessToken')
    expect(authSource).not.toContain('session.sessionToken')
    expect(authSource).not.toContain('account.access_token')
  })
})
