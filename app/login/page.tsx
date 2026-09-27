import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AuthForm } from '@/components/auth-form'

export const dynamic = 'force-dynamic'

const ERRORS: Record<string, string> = {
  AccessDenied: 'This account is not authorized to access the Command Center.',
  Configuration: 'Sign-in is temporarily unavailable. Please try again later.',
  OAuthAccountNotLinked: 'This email is linked to a different sign-in method.',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth()
  if (session?.user) redirect('/')
  const { error } = await searchParams
  const initialError = error ? ERRORS[error] ?? 'Sign-in failed. Please try again.' : undefined
  return <AuthForm initialError={initialError} />
}
