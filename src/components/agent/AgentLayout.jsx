import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Compass,
  LogOut,
  Globe,
  Menu,
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';

export function AgentLayout() {
  const { user, profile, logout } = useAuth();
  const { plots = [], appointments = [], enquiries = [] } = useAppState() || {};
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const availablePlotsCount = plots.filter((p) => p.status === 'available').length;
  const upcomingApptsCount = appointments.filter((a) => a.status === 'Upcoming' || a.status === 'Scheduled').length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New' || e.status === 'In Progress').length;

  const agentNavItems = [
    {
      to: '/agent',
      end: true,
      label: 'Agent Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/agent/plots',
      label: 'Property Inventory',
      icon: MapPin,
      badge: availablePlotsCount,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      to: '/agent/appointments',
      label: 'Client Site Visits',
      icon: Calendar,
      badge: upcomingApptsCount,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      to: '/agent/enquiries',
      label: 'Customer Leads',
      icon: Compass,
      badge: newEnquiriesCount,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = profile?.name || user?.displayName || user?.name || 'Property Agent';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      {/* Desktop Fixed Agent Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-slate-200/80 flex-col h-screen fixed top-0 left-0 z-30">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <Link to="/agent" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
              <span className="font-extrabold text-sm tracking-tight">LK</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none flex items-center gap-1.5 font-display">
                <span>PROPERTIES</span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                  AGENT
                </span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider truncate mt-0.5">
                Field & Property Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Agent Profile Chip */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
              <p className="text-[10px] font-semibold text-teal-700 truncate">Field Property Agent</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
            Agent Navigation
          </div>
          {agentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 shadow-xs border border-teal-200/80 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-teal-700" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
            Quick Links
          </div>
          <Link
            to="/plots"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Public Plot Catalog</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <Link
            to="/emi"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Plot EMI Calculator</span>
            </div>
          </Link>
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col w-72 h-full bg-white shadow-2xl p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white grid place-items-center font-bold text-xs">
                  LK
                </div>
                <span className="font-extrabold text-sm text-slate-900 font-display">AGENT PORTAL</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1">
              {agentNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                        isActive
                          ? 'bg-teal-50 text-teal-900 font-extrabold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-teal-700" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64 xl:pl-72 flex flex-col flex-1 min-w-0">
        {/* Agent Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Welcome, <span className="text-teal-700">{displayName}</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Field Operations • Property Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </Link>
              <Link
                to="/agent/appointments"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Visit</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl w-full mx-auto pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AgentLayout;
