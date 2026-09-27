export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { isEmailAllowed } from '@/lib/access'

// Pre-validates credentials so the login form can show a precise error before calling signIn().
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (!isEmailAllowed(email)) {
      return NextResponse.json({ error: 'This email is not authorized to access the Command Center.' }, { status: 403 })
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/auth/login] error:', error)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
