import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  Building2,
  FolderLock,
  Compass,
  BarChart3,
  BadgePercent,
  Settings,
  Info,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function MobileMorePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      to: ROUTES.PROJECTS,
      label: 'Manage Projects',
      desc: 'Master layouts, project phases, and survey numbers',
      icon: Building2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      to: ROUTES.SALES,
      label: 'Sales & Profit Margin',
      desc: 'Track gross turnover and realized profits',
      icon: BadgePercent,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      to: ROUTES.DOCUMENTS,
      label: 'Documents Vault',
      desc: 'Title deeds, layout plans, and buyer KYC',
      icon: FolderLock,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      to: ROUTES.ENQUIRIES,
      label: 'Inbound Enquiries',
      desc: 'Web, Facebook, WhatsApp & walk-in leads',
      icon: Compass,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      to: ROUTES.REPORTS,
      label: 'Reports & Analytics',
      desc: 'Inventory velocity, sales, conversion reports',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      to: ROUTES.SETTINGS,
      label: 'Settings & Workspace',
      desc: 'RERA credentials, team roles, and profile',
      icon: Settings,
      color: 'bg-slate-100 text-slate-700',
    },
    {
      to: ROUTES.ABOUT,
      label: 'About LK PROPERTIES',
      desc: 'System info, contact, and legal compliance',
      icon: Info,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <PageHeader title="More Features" subtitle="Access system tools & business modules" />

      {/* User Card */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
            }
            alt=""
            className="w-12 h-12 rounded-full object-cover border border-emerald-300"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {user?.name || 'Vikram Mehta'}
            </h3>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Promotional Land Investment Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 to-slate-900 p-5 text-white shadow-sm">
        <div className="relative z-10 space-y-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <Sparkles className="w-3 h-3" /> Exclusive Advisory
          </span>
          <h4 className="text-base font-extrabold leading-snug">
            Invest in Land — Invest in Your Future
          </h4>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Plotted real estate delivers 2.8x higher capital appreciation over 5-year horizons in Tier-1 suburban corridors.
          </p>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.to}
              onClick={() => navigate(item.to)}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

MobileMorePage.propTypes = {};
