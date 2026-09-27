import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { isEmailAllowed } from '@/lib/access'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const password = String(credentials?.password ?? '')
        if (!email || !password || !isEmailAllowed(email)) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
      },
    }),
  ],
  cookies: {
    state: {
      name: 'authjs.state',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' },
    },
  },
  callbacks: {
    async signIn({ user }) {
      return isEmailAllowed(user?.email)
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: string }).role ?? 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {}
      return baseUrl
    },
  },
  logger: {
    error(error) {
      console.error('[auth] error:', error)
    },
  },
})
