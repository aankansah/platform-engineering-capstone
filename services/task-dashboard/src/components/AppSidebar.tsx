import type { ReactNode } from 'react'

type AppSidebarProps = {
  children: ReactNode
}

export function AppSidebar({ children }: AppSidebarProps) {
  return (
    <aside className="min-h-0 border-r border-[#d2e4ea] bg-[#f7fbfc] shadow-sm">
      {children}
    </aside>
  )
}
