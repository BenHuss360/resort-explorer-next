'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Hotspot } from '@/lib/db/schema'

interface SimpleHotspotModalProps {
  hotspot: Hotspot
  isOpen: boolean
  onClose: () => void
}

export function SimpleHotspotModal({ hotspot, isOpen, onClose }: SimpleHotspotModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-0 bg-[#F5F0E6] overflow-hidden">
        {/* Image Thumbnail */}
        {hotspot.imageUrl && (
          <div className="relative w-full h-36">
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5">
          <DialogHeader className="p-0">
            <DialogTitle className="text-lg font-semibold text-[#2F4F4F]">
              {hotspot.title}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-[#708090] mt-3 line-clamp-2 leading-relaxed">
            {hotspot.description}
          </p>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#2F4F4F]/10">
            <div className="w-2 h-2 bg-[#FFD27F] rounded-full animate-pulse" />
            <p className="text-xs text-[#708090] font-medium">
              Walk within 30m to unlock full details
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
