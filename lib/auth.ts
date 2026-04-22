import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
    async jwt({ token, account }) {
      if (account?.provider === 'google') {
        token.googleId = account.providerAccountId
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
}
