import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer group select-none ${
        isDark
          ? 'bg-slate-800/90 text-amber-400 hover:text-amber-300 hover:bg-slate-700/80 border border-slate-700/80 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
          : 'bg-white/90 text-slate-700 hover:text-indigo-600 hover:bg-slate-100/90 border border-slate-200/80 shadow-xs hover:shadow-md'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`w-5 h-5 transition-all duration-300 ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
              : 'opacity-0 -rotate-90 scale-50 absolute pointer-events-none'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-5 h-5 transition-all duration-300 ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 absolute pointer-events-none'
              : 'opacity-100 rotate-0 scale-100 text-slate-700 group-hover:text-indigo-600'
          }`}
        />
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool,
};

export default ThemeToggle;
