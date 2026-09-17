import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { AdminBottomNav } from './AdminBottomNav'

export function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <AdminSidebar />

        {/* Mobile / Tablet Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm transition-opacity animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <div className="relative z-10 flex flex-col h-full bg-white shadow-elevated animate-slide-in">
              <AdminSidebar
                isMobileDrawer={true}
                onClose={() => setMobileMenuOpen(false)}
                onItemClick={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 flex flex-col">
          <AdminHeader onMenuToggle={() => setMobileMenuOpen(true)} />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 animate-fade-in">
            {children || <Outlet />}
          </main>
        </div>
      </div>
      <AdminBottomNav />
    </div>
  )
}

export default AdminLayout
