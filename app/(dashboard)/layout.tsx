import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Sidebar } from './_components/sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return (
    <div className="flex min-h-screen">
      <Sidebar userName={session.user.name ?? null} userEmail={session.user.email ?? null} />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
