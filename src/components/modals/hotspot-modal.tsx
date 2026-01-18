'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Hotspot, OptionalField, BrandColors, BrandFonts } from '@/lib/db/schema'
import { BRAND_DEFAULTS } from '@/lib/db/schema'

interface HotspotModalProps {
  hotspot: Hotspot
  isOpen: boolean
  onClose: () => void
  brandColors?: BrandColors
  brandFonts?: BrandFonts
}

export function HotspotModal({ hotspot, isOpen, onClose, brandColors, brandFonts }: HotspotModalProps) {
  const primaryColor = brandColors?.primary || BRAND_DEFAULTS.primaryColor
  const secondaryColor = brandColors?.secondary || BRAND_DEFAULTS.secondaryColor
  const primaryFont = brandFonts?.primary || BRAND_DEFAULTS.primaryFont
  const secondaryFont = brandFonts?.secondary || BRAND_DEFAULTS.secondaryFont
  const headingFontFamily = primaryFont === 'default' ? 'inherit' : `"${primaryFont}", serif`
  const bodyFontFamily = secondaryFont === 'default' ? 'inherit' : `"${secondaryFont}", sans-serif`
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
              <div className="w-8 h-0.5" style={{ backgroundColor: secondaryColor }} />
              <span className="text-xs uppercase tracking-wider text-[#708090] font-medium">
                Point of Interest
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold" style={{ color: primaryColor, fontFamily: headingFontFamily }}>{hotspot.title}</DialogTitle>
          </DialogHeader>

          {/* Description */}
          <p className="text-[#708090] leading-relaxed text-base" style={{ fontFamily: bodyFontFamily }}>{hotspot.description}</p>

          {/* Audio Player - Luxury styled */}
          {hotspot.audioUrl && (
            <div className="bg-white/60 rounded-xl p-5 border" style={{ borderColor: `${secondaryColor}30` }}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full text-[#F5F0E6] flex items-center justify-center hover:opacity-90 transition-all duration-300 shadow-lg"
                  style={{ backgroundColor: primaryColor }}
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
                  <p className="font-semibold text-sm" style={{ color: primaryColor }}>Audio Guide</p>
                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: `${primaryColor}15` }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: isPlaying ? '30%' : '0%', backgroundColor: secondaryColor }}
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
                  className="bg-white/60 rounded-xl p-4 flex items-start gap-3 border border-transparent hover:border-gray-200 transition-colors duration-300"
                >
                  <span className="text-xl">{field.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: primaryColor }}>{field.title}</p>
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
