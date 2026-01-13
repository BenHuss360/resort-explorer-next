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
      <DialogContent className="max-w-sm p-0">
        {/* Image Thumbnail */}
        {hotspot.imageUrl && (
          <div className="relative w-full h-32">
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
        )}

        <div className="p-4">
          <DialogHeader className="p-0">
            <DialogTitle className="text-lg font-semibold">
              {hotspot.title}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {hotspot.description}
          </p>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Walk within 30m to see full details
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
