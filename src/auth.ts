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
        id: {},
        password: {},
      },
      // Todo: Change the return value to the user object
      authorize: async (credentials) => {
        const { id, password, email } = credentials

        if (!id) {
          const user = await getUserByEmail(email as string)
          if (!user) return null
          return user
        }

        const request = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/check-vlu-account?id=${id}&password=${password}`, {
          method: 'GET',
        })

        // TODO: Tạo tài khoản mới cho người dùng
        if (!request.ok) return null

        return { name: 'VLU User' }
      },
    }),
  ],
})
