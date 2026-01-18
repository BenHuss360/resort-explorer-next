'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Hotspot, OptionalField } from '@/lib/db/schema'

interface HotspotModalProps {
  hotspot: Hotspot
  isOpen: boolean
  onClose: () => void
}

export function HotspotModal({ hotspot, isOpen, onClose }: HotspotModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const optionalFields = (hotspot.optionalFields || []) as OptionalField[]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-[#F5F0E6]">
        {/* Image with subtle overlay */}
        {hotspot.imageUrl && (
          <div className="relative w-full h-64 overflow-hidden rounded-t-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- User-uploaded image from external URL */}
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F0E6]/20 to-transparent" />
          </div>
        )}

        <div className="p-8 space-y-6">
          {/* Header with decorative element */}
          <DialogHeader className="p-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-0.5 bg-[#FFD27F]" />
              <span className="text-xs uppercase tracking-wider text-[#708090] font-medium">
                Point of Interest
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold text-[#2F4F4F]">{hotspot.title}</DialogTitle>
          </DialogHeader>

          {/* Description */}
          <p className="text-[#708090] leading-relaxed text-base">{hotspot.description}</p>

          {/* Audio Player - Luxury styled */}
          {hotspot.audioUrl && (
            <div className="bg-white/60 rounded-xl p-5 border border-[#FFD27F]/30">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full bg-[#2F4F4F] text-[#F5F0E6] flex items-center justify-center hover:bg-[#3a5f5f] transition-all duration-300 shadow-lg"
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#2F4F4F]">Audio Guide</p>
                  <div className="h-1.5 bg-[#2F4F4F]/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#FFD27F] rounded-full transition-all duration-500"
                      style={{ width: isPlaying ? '30%' : '0%' }}
                    />
                  </div>
                </div>
                <span className="text-sm text-[#708090] font-medium">3:24</span>
              </div>
            </div>
          )}

          {/* Optional Fields - Card-like styling */}
          {optionalFields.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {optionalFields.map((field, index) => (
                <div
                  key={index}
                  className="bg-white/60 rounded-xl p-4 flex items-start gap-3 border border-[#2F4F4F]/5 hover:border-[#FFD27F]/30 transition-colors duration-300"
                >
                  <span className="text-xl">{field.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-[#2F4F4F]">{field.title}</p>
                    <p className="text-[#708090] text-sm">{field.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
