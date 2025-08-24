import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { AuthOptions } from 'next-auth'

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || (() => {
    throw new Error('NEXTAUTH_SECRET is required for secure authentication');
  })(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/calendar.readonly'
          ].join(' ')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      // Don't send accessToken to client for security
      // Access token is kept server-side only via getServerSession
      return session
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign in
    error: '/', // Redirect to home page on error
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
