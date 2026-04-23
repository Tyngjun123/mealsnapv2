import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { randomUUID } from 'crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize() {
        try {
          const guestId = `guest_${randomUUID()}`
          const { upsertUser } = await import('./db')
          await upsertUser({
            googleId: guestId,
            email: `${guestId}@guest`,
            name: 'Guest',
            avatarUrl: '',
          })
          return { id: guestId, name: 'Guest', email: `${guestId}@guest` }
        } catch (e) {
          console.error('Guest sign-in failed:', e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const { upsertUser } = await import('./db')
          await upsertUser({
            googleId: account.providerAccountId,
            email: user.email,
            name: user.name ?? '',
            avatarUrl: user.image ?? '',
          })
        } catch (e) {
          console.error('DB upsert failed (migration not run yet?):', e)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, user }) {
      if (account?.provider === 'google') {
        token.googleId = account.providerAccountId
      }
      if (account?.provider === 'guest' && user?.id) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
}
