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
    <div className="absolute inset-0 z-[1001] flex flex-col">
      {/* Backdrop with softer blur */}
      <div
        className="flex-1 bg-[#2F4F4F]/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="bg-[#F5F0E6] rounded-t-3xl max-h-[75%] overflow-y-auto shadow-2xl">
        {/* Drag handle - gold accent */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-[#F5F0E6]">
          <div className="w-12 h-1 bg-[#FFD27F] rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-white/60 rounded-full flex items-center justify-center text-[#708090] hover:bg-white hover:text-[#2F4F4F] transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        {hotspot.imageUrl && (
          <div className="relative w-full h-36 overflow-hidden">
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Header with decorative line */}
          <div>
            <div className="w-6 h-0.5 bg-[#FFD27F] mb-3" />
            <h3 className="text-xl font-bold text-[#2F4F4F] leading-tight">{hotspot.title}</h3>
          </div>

          {/* Description */}
          <p className="text-[#708090] text-sm leading-relaxed">{hotspot.description}</p>

          {/* Audio Player - Luxury styled */}
          {hotspot.audioUrl && (
            <div className="bg-white/60 rounded-xl p-4 border border-[#FFD27F]/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-[#2F4F4F] text-[#F5F0E6] flex items-center justify-center hover:bg-[#3a5f5f] transition-all duration-300 shadow-lg flex-shrink-0"
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-[#2F4F4F]">Audio Guide</p>
                  <div className="h-1.5 bg-[#2F4F4F]/10 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#FFD27F] rounded-full transition-all duration-500"
                      style={{ width: isPlaying ? '30%' : '0%' }}
                    />
                  </div>
                </div>
                <span className="text-xs text-[#708090] font-medium flex-shrink-0">3:24</span>
              </div>
            </div>
          )}

          {/* Optional Fields */}
          {optionalFields.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {optionalFields.map((field, index) => (
                <div
                  key={index}
                  className="bg-white/60 rounded-xl p-3 flex items-start gap-2 border border-[#2F4F4F]/5"
                >
                  <span className="text-base">{field.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-[#2F4F4F] truncate">{field.title}</p>
                    <p className="text-[#708090] text-xs truncate">{field.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom padding for home indicator */}
        <div className="h-8" />
      </div>
    </div>
  )
}
