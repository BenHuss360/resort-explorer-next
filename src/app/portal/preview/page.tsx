'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'
import type { Hotspot } from '@/lib/db/schema'
import { HotspotModal } from '@/components/modals/hotspot-modal'

const LeafletMap = dynamic(
  () => import('@/components/map/leaflet-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
)

export default function PortalPreviewPage() {
  const { project } = useProject()
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)

  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['hotspots', project?.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${project!.id}/hotspots`)
      if (!res.ok) throw new Error('Failed to fetch hotspots')
      return res.json() as Promise<Hotspot[]>
    },
    enabled: !!project?.id,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mobile Preview</h2>
        <p className="text-sm text-gray-500">
          {hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''} on map
        </p>
      </div>

      {/* Phone Frame */}
      <div className="flex justify-center py-4">
        <div className="relative">
          {/* Phone outer frame */}
          <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
            {/* Phone screen */}
            <div className="bg-white rounded-[2.25rem] overflow-hidden w-[320px] h-[640px] relative">
              {/* Status bar */}
              <div className="bg-emerald-600 px-6 py-2 flex items-center justify-between">
                <span className="text-white/90 text-xs font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 bg-white/90 rounded-sm" />
                </div>
              </div>

              {/* App header */}
              <div className="bg-emerald-600 px-4 py-3 border-b border-emerald-700">
                <h3 className="text-white font-semibold text-sm">{project?.resortName || 'Resort'}</h3>
                <p className="text-emerald-100 text-xs">Discover amazing spots around you</p>
              </div>

              {/* Map area */}
              <div className="h-[calc(100%-88px)] relative">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
                    Loading...
                  </div>
                ) : (
                  <LeafletMap
                    hotspots={hotspots}
                    userLocation={null}
                    boundaries={project?.boundaries}
                    customOverlay={project?.customMapOverlay}
                    onHotspotClick={setSelectedHotspot}
                  />
                )}
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-gray-900 rounded-full" />
          </div>

          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-[4rem] blur-2xl -z-10" />
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Click on markers to preview how they will appear to guests on their mobile devices.
      </p>

      {selectedHotspot && (
        <HotspotModal
          hotspot={selectedHotspot}
          isOpen={!!selectedHotspot}
          onClose={() => setSelectedHotspot(null)}
        />
      )}
    </div>
  )
}
