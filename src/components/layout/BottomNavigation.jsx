import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { LayoutDashboard, MapPin, Plus, Users, Menu } from 'lucide-react';

export function BottomNavigation({ onAddClick }) {
  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* 1. Home */}
        <NavLink
          to={ROUTES.HOME}
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">Home</span>
            </>
          )}
        </NavLink>

        {/* 2. Plots */}
        <NavLink
          to={ROUTES.PLOTS}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <MapPin className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">Plots</span>
            </>
          )}
        </NavLink>

        {/* 3. Central Add Button (+) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onAddClick}
            aria-label="Quick Action Menu"
            className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg shadow-emerald-600/35 flex items-center justify-center border-4 border-white transition-all cursor-pointer ring-1 ring-slate-200"
          >
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </button>
          <span className="text-[10px] font-bold text-slate-600 mt-0.5">Add</span>
        </div>

        {/* 4. Customers */}
        <NavLink
          to={ROUTES.CUSTOMERS}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Users className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">Customers</span>
            </>
          )}
        </NavLink>

        {/* 5. More */}
        <NavLink
          to={ROUTES.MORE}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
              isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Menu className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">More</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

BottomNavigation.propTypes = {
  onAddClick: PropTypes.func.isRequired,
};
