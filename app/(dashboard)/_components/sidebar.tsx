'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Video,
  Link2,
  TrendingUp,
  Shirt,
  BarChart3,
  Settings,
  Menu,
  X,
  DollarSign,
  ChevronLeft,
  LogOut,
  Clapperboard,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/content-factory', label: 'AI Content Factory', icon: Video },
  { href: '/youtube-studio', label: 'YouTube Studio', icon: Clapperboard },
  { href: '/affiliate-hub', label: 'Affiliate Hub', icon: Link2 },
  { href: '/arbitrage', label: 'Arbitrage Scanner', icon: TrendingUp },
  { href: '/print-on-demand', label: 'Print-on-Demand', icon: Shirt },
  { href: '/simulator', label: 'Income Simulator', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ userName, userEmail }: { userName: string | null; userEmail: string | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col border-r border-border bg-card transition-all duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center gap-3 p-4 border-b border-border', collapsed && 'justify-center px-2')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-sm font-bold tracking-tight text-foreground truncate">Pharaoh's Edge</h1>
              <p className="text-[10px] text-muted-foreground">Command Center</p>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden p-1 rounded hover:bg-accent"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {(navItems ?? []).map((item: typeof navItems[0]) => {
            const isActive = pathname === item?.href || (item?.href !== '/' && pathname?.startsWith?.(item?.href ?? ''))
            return (
              <Link
                key={item?.href}
                href={item?.href ?? '/'}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-fast',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-primary' : '')} />
                {!collapsed && <span className="truncate">{item?.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Account */}
        <div className={cn('border-t border-border p-3', collapsed && 'px-2')}>
          {!collapsed && (
            <div className="mb-2 px-1 overflow-hidden">
              <p className="text-xs font-medium text-foreground truncate">{userName || 'Signed in'}</p>
              <p className="text-[10px] text-muted-foreground truncate" suppressHydrationWarning>{userEmail}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ redirectTo: '/login' })}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              collapsed && 'justify-center px-2'
            )}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center p-3 border-t border-border hover:bg-accent transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>
    </>
  )
}
