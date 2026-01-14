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
    <div className="absolute inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="bg-white rounded-t-2xl max-h-[75%] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        {hotspot.imageUrl && (
          <div className="relative w-full h-32">
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header */}
          <h3 className="text-lg font-bold leading-tight">{hotspot.title}</h3>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">{hotspot.description}</p>

          {/* Audio Player */}
          {hotspot.audioUrl && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors flex-shrink-0"
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
                  <p className="font-medium text-xs">Audio Guide</p>
                  <div className="h-1 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: isPlaying ? '30%' : '0%' }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">3:24</span>
              </div>
            </div>
          )}

          {/* Optional Fields */}
          {optionalFields.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {optionalFields.map((field, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-2 flex items-start gap-1.5"
                >
                  <span className="text-base">{field.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-xs truncate">{field.title}</p>
                    <p className="text-gray-500 text-xs truncate">{field.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom padding for home indicator */}
        <div className="h-6" />
      </div>
    </div>
  )
}
