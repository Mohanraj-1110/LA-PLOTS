import React from 'react'
import { Outlet } from 'react-router-dom'
import { UserHeader } from './UserHeader'
import { UserFooter } from './UserFooter'
import { UserBottomNav } from './UserBottomNav'
import { WhatsAppButton } from '../common/WhatsAppButton'

export function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-green-100 selection:text-green-800">
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
