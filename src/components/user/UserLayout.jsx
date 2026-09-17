import React from 'react'
import { Outlet } from 'react-router-dom'
import { UserHeader } from './UserHeader'
import { UserFooter } from './UserFooter'

export function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <UserHeader />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <UserFooter />
    </div>
  )
}
