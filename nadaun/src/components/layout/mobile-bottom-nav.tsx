'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/students', label: '키움이', icon: '👤' },
  { href: '/standards', label: '성취기준', icon: '📋' },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      aria-label="모바일 하단 네비게이션"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg" aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
