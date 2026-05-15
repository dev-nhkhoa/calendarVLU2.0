import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
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
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      },
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.sessionToken = token.accessToken as string
      return session
    },
  },
  providers: [
    Google({
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_TENANT_ID || 'common',
      authorization: {
        params: {
          scope: 'openid profile email User.Read Calendars.ReadWrite offline_access',
        },
      },
    }),
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
