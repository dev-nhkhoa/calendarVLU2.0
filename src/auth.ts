import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { getUserByEmail } from './actions/auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({}),
    Credentials({
      credentials: {
        userEmail: {},
      },
      authorize: async (credentials) => {
        const { userEmail } = credentials as { userEmail: string }

        const user = await getUserByEmail(userEmail)

        if (!user) return null

        return user
      },
    }),
  ],
})
