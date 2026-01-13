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
        <h2 className="text-lg font-semibold">Map Preview</h2>
        <p className="text-sm text-gray-500">
          {hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''} on map
        </p>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden" style={{ height: '500px' }}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
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

      <p className="text-sm text-gray-500">
        Click on markers to preview how they will appear to guests.
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
