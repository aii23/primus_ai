import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SiweMessage } from 'siwe'
import { prisma } from './prisma'
import { deleteAuthNonce, getAuthNonce } from './auth-nonce'

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

        const storedNonce = await getAuthNonce(siwe.address)
        if (!storedNonce) return null // expired or never issued

        const result = await siwe.verify({
          signature: credentials.signature,
          nonce: storedNonce,
        })

        if (!result.success) return null

        await deleteAuthNonce(siwe.address)

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
      if (user) {
        token.address = user.id

        // Ensure the user record exists in the database on first sign-in.
        // Using upsert so re-logins are safe and connections can always
        // reference a valid User row via the foreign key.
        await prisma.user.upsert({
          where: { address: user.id },
          update: {},
          create: { address: user.id },
        })
      }
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
