import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Calendar,
  BadgePercent,
  FolderLock,
  Compass,
  BarChart3,
  UserCheck,
  Settings,
  Info,
  LogOut,
  ChevronRight,
  Globe,
  ExternalLink,
  X,
} from 'lucide-react';

export function Sidebar({ className = '', isMobileDrawer = false, onClose, onItemClick }) {
  const { user, profile, role, logout } = useAuth();
  const { plots = [], customers = [], appointments = [] } = useAppState() || {};
  const navigate = useNavigate();

  const availablePlotsCount = plots.filter((p) => p.status === 'available').length;
  const activeCustomersCount = customers.filter(
    (c) => c.status !== 'Converted' && c.status !== 'Lost'
  ).length;
  const upcomingApptsCount = appointments.filter((a) => a.status === 'Upcoming').length;

  const navItems = [
    { to: ROUTES.HOME, label: 'Dashboard', icon: LayoutDashboard },
    {
      to: ROUTES.PLOTS,
      label: 'Plot Inventory',
      icon: MapPin,
      badge: availablePlotsCount,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      to: ROUTES.CUSTOMERS,
      label: 'Customers & Leads',
      icon: Users,
      badge: activeCustomersCount,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      to: ROUTES.APPOINTMENTS,
      label: 'Appointments',
      icon: Calendar,
      badge: upcomingApptsCount,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { to: ROUTES.SALES, label: 'Sales & Profit', icon: BadgePercent },
    { to: ROUTES.DOCUMENTS, label: 'Documents Vault', icon: FolderLock },
    { to: ROUTES.ENQUIRIES, label: 'Enquiries', icon: Compass },
    { to: ROUTES.REPORTS, label: 'Reports & Analytics', icon: BarChart3 },
    { to: ROUTES.USERS, label: 'Users & Roles', icon: UserCheck },
    { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
    { to: ROUTES.ABOUT, label: 'About LK PROPERTIES', icon: Info },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const displayName = profile?.name || user?.displayName || user?.name || 'Administrator';
  const displayRole = role ? (role.charAt(0).toUpperCase() + role.slice(1)) : 'Admin';
  const displayAvatar = profile?.photoURL || profile?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80';

  return (
    <aside
      className={`w-64 xl:w-72 bg-white border-r border-slate-200/80 flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-200 ${className}`}
    >
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-600/20 flex-shrink-0">
            <span className="font-extrabold text-sm tracking-tight">LK</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none flex items-center gap-1.5 font-display">
              <span>PROPERTIES</span>
              <span className="text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded bg-primary-100 text-primary-800">
                ADMIN
              </span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider truncate mt-0.5">
              Management Suite
            </p>
          </div>
        </Link>
        {isMobileDrawer && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.HOME}
              onClick={() => {
                if (onItemClick) onItemClick();
              }}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 ? (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* View Public Website Link */}
      <div className="px-3 py-2 border-t border-slate-100">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-primary-700 bg-primary-50/70 hover:bg-primary-100/70 transition-colors border border-primary-100"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-primary-600" />
            <span>View Public Website</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </Link>
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-primary-200 flex-shrink-0"
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] font-medium text-primary-700 truncate">
                {displayRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  className: PropTypes.string,
  isMobileDrawer: PropTypes.bool,
  onClose: PropTypes.func,
  onItemClick: PropTypes.func,
};

export default Sidebar;
