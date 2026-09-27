export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { isEmailAllowed } from '@/lib/access'

// Registration is open, but only emails on the ALLOWED_EMAILS list can sign in.
// Everyone else is stored as a pending account with no dashboard access.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')
    const name = String(body?.name ?? '').trim() || null

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing?.password) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { password: hashed, name: existing.name ?? name } })
    } else {
      await prisma.user.create({ data: { email, password: hashed, name } })
    }

    const approved = isEmailAllowed(email)
    return NextResponse.json(
      {
        ok: true,
        approved,
        message: approved ? 'Account created.' : 'Account created and pending owner approval.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[api/signup] error:', error)
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 })
  }
}
