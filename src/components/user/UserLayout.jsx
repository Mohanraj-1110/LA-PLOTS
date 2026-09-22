import React from 'react'
import { Outlet } from 'react-router-dom'
import { UserHeader } from './UserHeader'
import { UserFooter } from './UserFooter'
import { UserBottomNav } from './UserBottomNav'
import { WhatsAppButton } from '../common/WhatsAppButton'

export function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-[#080c16] text-surface-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-400 transition-colors duration-200">
      <UserHeader />
      <main className="flex-1 pb-16 md:pb-0">
        {children || <Outlet />}
      </main>
      <UserFooter />
      <UserBottomNav />
      <WhatsAppButton />
    </div>
  )
}
