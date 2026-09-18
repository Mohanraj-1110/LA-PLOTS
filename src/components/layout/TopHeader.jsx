import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routePaths';
import {
  Bell,
  Plus,
  Menu,
  Globe,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Settings,
} from 'lucide-react';

export function TopHeader({ onOpenQuickAdd, onMenuToggle }) {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const mockAlerts = [
    {
      id: 1,
      title: 'Site Visit Confirmed',
      desc: 'Dr. Suresh Reddy at Sunrise Enclave tomorrow 10:30 AM',
      time: '10m ago',
      type: 'visit',
    },
    {
      id: 2,
      title: 'Booking Advance Received',
      desc: '₹1 Lakh token advance for plot GM-102 by Ananya Sharma',
      time: '1h ago',
      type: 'payment',
    },
    {
      id: 3,
      title: 'New Facebook Lead',
      desc: 'Gaurav Kulkarni interested in Hinjewadi plot GA-08',
      time: '3h ago',
      type: 'lead',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const displayName = profile?.name || user?.displayName || user?.name || 'Administrator';
  const displayRole = role ? (role.charAt(0).toUpperCase() + role.slice(1)) : 'Admin';
  const displayAvatar = profile?.photoURL || profile?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80';

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger + Mobile brand / Desktop greeting */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-xs font-bold text-xs">
              LA
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 tracking-tight leading-none block font-display">
                PLOTS
              </span>
              <span className="text-[9px] font-bold text-primary-700 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-slate-800">
              Welcome, <span className="text-primary-600">{displayName}</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Public Website button */}
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100/70 border border-primary-200/60 rounded-xl transition-all"
            title="Open customer-facing website"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          {/* Quick Add Plot / Customer CTA (Desktop) */}
          {onOpenQuickAdd && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenQuickAdd}
                className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Action</span>
              </button>
            </div>
          )}

          {/* Notifications button & dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-scale-in">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Notifications
                    </h4>
                    <span className="text-[10px] bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {mockAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-primary-50/50 transition-colors border border-slate-100"
                      >
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {alt.title}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {alt.desc}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">
                          {alt.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-primary-200"
                loading="lazy"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-scale-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] font-medium text-primary-600 truncate">
                      {displayRole} • {user?.email || 'Admin'}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={ROUTES.SETTINGS}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Workspace Settings</span>
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>View Public Website</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

TopHeader.propTypes = {
  onOpenQuickAdd: PropTypes.func,
  onMenuToggle: PropTypes.func,
};

export default TopHeader;
