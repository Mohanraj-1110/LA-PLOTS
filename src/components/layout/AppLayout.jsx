import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { BottomNavigation } from './BottomNavigation';
import { QuickAddModal } from '../common/QuickAddModal';

export function AppLayout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080c16] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop fixed sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative z-10 flex flex-col h-full bg-white dark:bg-slate-900 shadow-2xl animate-slide-in">
            <Sidebar
              isMobileDrawer={true}
              onClose={() => setMobileMenuOpen(false)}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main viewport area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 xl:pl-72 flex flex-col flex-1 min-w-0">
        {/* Global top sticky header */}
        <TopHeader
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl w-full mx-auto pb-28 lg:pb-12">
          <Outlet />
        </main>

        {/* Mobile bottom navigation bar */}
        <BottomNavigation onAddClick={() => setQuickAddOpen(true)} />

        {/* Universal Quick Action Modal */}
        <QuickAddModal
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
        />
      </div>
    </div>
  );
}

AppLayout.propTypes = {};

export default AppLayout;
