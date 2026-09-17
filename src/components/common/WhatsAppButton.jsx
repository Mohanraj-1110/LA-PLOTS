import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function WhatsAppButton({ phoneNumber = '919876543210', defaultMessage = 'Hello LA PLOTS, I would like to inquire about available plots.' }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const encodedMsg = encodeURIComponent(defaultMessage)
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`

  return (
    <div className="fixed bottom-20 right-4 z-30 md:bottom-6 md:right-6 flex flex-col items-end">
      {showTooltip && (
        <div className="mb-3 relative flex items-center gap-2 rounded-xl bg-surface-900 px-4 py-2.5 text-xs font-medium text-white shadow-elevated animate-slide-up">
          <span>Chat with Property Advisor</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowTooltip(false)
            }}
            className="text-surface-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="flex size-12 md:size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 hover:bg-[#1EBE5D] hover:scale-110 hover:shadow-[#25D366]/40 active:scale-95 transition-all duration-200"
        aria-label="Chat on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle size={26} fill="currentColor" className="text-white" />
      </a>
    </div>
  )
}

export default WhatsAppButton
