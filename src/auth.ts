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
      },
      authorize: async (credentials) => {
        const { id, password, userEmail } = credentials as { id: string; password: string; userEmail: string }

        console.log(userEmail)

        const user = await getUserByEmail(userEmail)
        console.log(user)

        if (!user) return null

        //Add Van Lang Account to DB
        const vluCredentialAccount = await addVLUCredentialAccount({ id, password, userId: user.id })
        console.log(vluCredentialAccount)

        if (!vluCredentialAccount) return null

        return user
      },
    }),
  ],
})
