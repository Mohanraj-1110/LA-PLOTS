import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { AdminBottomNav } from './AdminBottomNav'

export function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="min-w-0 flex-1 flex flex-col">
          <AdminHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
            {children || <Outlet />}
          </main>
        </div>
      </div>
      <AdminBottomNav />
    </div>
  )
}
