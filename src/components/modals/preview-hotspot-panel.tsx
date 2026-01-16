'use client'

import { useState } from 'react'
import type { Hotspot, OptionalField } from '@/lib/db/schema'

interface PreviewHotspotPanelProps {
  hotspot: Hotspot
  onClose: () => void
}

export function PreviewHotspotPanel({ hotspot, onClose }: PreviewHotspotPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const optionalFields = (hotspot.optionalFields || []) as OptionalField[]

  return (
    <div className="absolute inset-0 z-[1001]">
      {/* Backdrop - covers entire area */}
      <div
        className="absolute inset-0 bg-[#2F4F4F]/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel - positioned at bottom with insets for visible rounded corners */}
      <div className="absolute left-2 right-2 bottom-2 max-h-[70%] bg-[#F5F0E6] rounded-2xl overflow-hidden shadow-2xl">
        <div className="max-h-full overflow-y-auto">
          {/* Drag handle - gold accent */}
          <div className="flex justify-center pt-2 pb-1.5 sticky top-0 bg-[#F5F0E6] z-10">
            <div className="w-8 h-0.5 bg-[#FFD27F] rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 bg-white/60 rounded-full flex items-center justify-center text-[#708090] hover:bg-white hover:text-[#2F4F4F] transition-colors duration-300 z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          {hotspot.imageUrl && (
            <div className="relative w-full h-24 overflow-hidden">
              <img
                src={hotspot.imageUrl}
                alt={hotspot.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-3 space-y-2.5">
            {/* Header with decorative line */}
            <div>
              <div className="w-4 h-0.5 bg-[#FFD27F] mb-1.5" />
              <h3 className="text-sm font-bold text-[#2F4F4F] leading-tight">{hotspot.title}</h3>
            </div>

            {/* Description */}
            <p className="text-[#708090] text-xs leading-relaxed">{hotspot.description}</p>

            {/* Audio Player - Luxury styled */}
            {hotspot.audioUrl && (
              <div className="bg-white/60 rounded-lg p-2.5 border border-[#FFD27F]/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-7 h-7 rounded-full bg-[#2F4F4F] text-[#F5F0E6] flex items-center justify-center hover:bg-[#3a5f5f] transition-all duration-300 shadow-md flex-shrink-0"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[10px] text-[#2F4F4F]">Audio Guide</p>
                    <div className="h-1 bg-[#2F4F4F]/10 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-[#FFD27F] rounded-full transition-all duration-500"
                        style={{ width: isPlaying ? '30%' : '0%' }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#708090] font-medium flex-shrink-0">3:24</span>
                </div>
              </div>
            )}

            {/* Optional Fields */}
            {optionalFields.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {optionalFields.map((field, index) => (
                  <div
                    key={index}
                    className="bg-white/60 rounded-lg p-2 flex items-start gap-1.5 border border-[#2F4F4F]/5"
                  >
                    <span className="text-xs">{field.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[10px] text-[#2F4F4F] truncate">{field.title}</p>
                      <p className="text-[#708090] text-[10px] truncate">{field.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom padding for home indicator */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}
