import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5 focus:ring-primary-500',
    secondary: 'bg-white border border-surface-200 text-surface-700 shadow-sm hover:bg-surface-50 hover:border-surface-300 hover:shadow-md focus:ring-surface-300',
    outline: 'border-2 border-primary-500 text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20 hover:from-red-700 hover:to-red-600 hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5 focus:ring-red-500',
    ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-800 focus:ring-surface-300',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-600 hover:shadow-lg focus:ring-emerald-500',
    accent: 'bg-gradient-to-r from-accent-500 to-orange-500 text-white shadow-md shadow-accent-500/20 hover:from-accent-600 hover:to-orange-600 hover:shadow-lg hover:-translate-y-0.5 focus:ring-accent-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs min-h-8',
    md: 'px-4 py-2.5 text-sm min-h-10',
    lg: 'px-6 py-3 text-base min-h-12',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
