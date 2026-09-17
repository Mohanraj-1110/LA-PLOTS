import React from 'react'

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center p-12" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="size-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
          <div className="absolute inset-0 size-10 rounded-full border-4 border-transparent border-b-accent-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm text-surface-500 font-medium">{message}</p>
      </div>
    </div>
  )
}
