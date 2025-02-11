import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { getCredentialAccountByUserId, getUserByEmail, verifyPassword } from './actions/auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({}),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const { password, email } = credentials

        const user = await getUserByEmail(email as string)
        if (!user) return null
        const credentialAccount = await getCredentialAccountByUserId(user.id)
        if (!credentialAccount) return null
        const isValid = await verifyPassword(password as string, credentialAccount.hass_password as string)
        if (!isValid) return null

        return user
      },
    }),
  ],
})
