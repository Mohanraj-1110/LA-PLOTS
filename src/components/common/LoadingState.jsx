import React from 'react'

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center p-12" role="status">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-green-600" />
        <p className="text-sm text-slate-500 font-medium">{message}</p>
      </div>
    </div>
  )
}
