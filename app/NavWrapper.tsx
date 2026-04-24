'use client'
import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav'

const NAV_PATHS = new Set(['/', '/history', '/stats', '/profile', '/workout'])

export function NavWrapper() {
  const pathname = usePathname()
  if (!NAV_PATHS.has(pathname)) return null
  return <BottomNav />
}
