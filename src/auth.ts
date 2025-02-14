import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { addVLUCredentialAccount, getUserByEmail } from './actions/auth'

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
        id: {},
        password: {},
        userEmail: {},
        cookie: {},
      },
      authorize: async (credentials) => {
        const { id, password, cookie, userEmail } = credentials as { id: string; password: string; cookie: string; userEmail: string }

        const user = await getUserByEmail(userEmail)

        if (!user) return null

        //Add Van Lang Account to DB
        const vluCredentialAccount = await addVLUCredentialAccount({ id, password, cookie, userId: user.id })

        if (!vluCredentialAccount) return null

        return user
      },
    }),
  ],
})
