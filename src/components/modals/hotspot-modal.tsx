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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Image */}
        {hotspot.imageUrl && (
          <div className="relative w-full h-64">
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Header */}
          <DialogHeader className="p-0">
            <DialogTitle className="text-2xl font-bold">{hotspot.title}</DialogTitle>
          </DialogHeader>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{hotspot.description}</p>

          {/* Audio Player */}
          {hotspot.audioUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
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
                  <p className="font-medium text-sm">Audio Guide</p>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: isPlaying ? '30%' : '0%' }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500">3:24</span>
              </div>
            </div>
          )}

          {/* Optional Fields */}
          {optionalFields.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {optionalFields.map((field, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 flex items-start gap-2"
                >
                  <span className="text-xl">{field.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{field.title}</p>
                    <p className="text-gray-500 text-sm">{field.subtitle}</p>
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
