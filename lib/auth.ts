import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SiweMessage } from 'siwe'
import { nonceStore } from './nonce-store'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'SIWE Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) return null

        const siwe = new SiweMessage(credentials.message)

        const storedNonce = nonceStore.get(siwe.address)
        if (!storedNonce) return null // expired or never issued

        const result = await siwe.verify({
          signature: credentials.signature,
          nonce: storedNonce,
        })

        if (!result.success) return null

        nonceStore.delete(siwe.address)

        return {
          id: siwe.address,
          name: siwe.address,
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.address = user.id
      return token
    },
    async session({ session, token }) {
      if (token.address) {
        session.address = token.address as string
      }
      return session
    },
  },

  pages: { signIn: '/' },
  secret: process.env.NEXTAUTH_SECRET,
}
