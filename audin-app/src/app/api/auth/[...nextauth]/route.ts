import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { AuthOptions } from 'next-auth'

// Check if OAuth is properly configured
const hasOAuthConfig = !!(
  process.env.NEXTAUTH_SECRET && 
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET
);

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'demo-fallback-secret-not-for-production',
  providers: hasOAuthConfig ? [
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
  ] : [], // Empty providers array if OAuth not configured
  // Disable NextAuth when no providers are configured
  ...(hasOAuthConfig ? {} : {
    session: { strategy: 'jwt' },
    pages: {
      signIn: '/',
      error: '/',
    }
  }),
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

// Create handler with error handling for when OAuth is not configured
const handler = hasOAuthConfig 
  ? NextAuth(authOptions)
  : NextAuth({
      ...authOptions,
      // Minimal configuration for demo mode
      callbacks: {
        async signIn() {
          return false; // Prevent sign-in when OAuth not configured
        }
      }
    });

export { handler as GET, handler as POST, hasOAuthConfig }
