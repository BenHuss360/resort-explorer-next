'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import type { Project, Hotspot, Boundaries, CustomMapOverlay, EmbedSettings } from '@/lib/db/schema'
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

interface EmbedClientProps {
  code: string
}

export function EmbedClient({ code }: EmbedClientProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)

  // Fetch project by access code
  const { data: rawProject, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', code],
    queryFn: async () => {
      const res = await fetch(`/api/projects/by-code/${code}`)
      if (!res.ok) throw new Error('Project not found')
      return res.json() as Promise<Project>
    },
  })

  // Transform raw project to match expected format
  const project = useMemo(() => {
    if (!rawProject) return null
    return {
      ...rawProject,
      boundaries: {
        north: rawProject.northBoundary,
        south: rawProject.southBoundary,
        east: rawProject.eastBoundary,
        west: rawProject.westBoundary,
      } as Boundaries,
      customMapOverlay: {
        imageUrl: rawProject.customMapImageUrl,
        northLat: rawProject.customMapNorthLat,
        southLat: rawProject.customMapSouthLat,
        westLng: rawProject.customMapWestLng,
        eastLng: rawProject.customMapEastLng,
        opacity: rawProject.customMapOpacity || 1.0,
        enabled: rawProject.customMapEnabled || false,
        gcps: (rawProject.customMapGCPs as CustomMapOverlay['gcps']) || [],
        calibrationMode: (rawProject.customMapCalibrationMode as CustomMapOverlay['calibrationMode']) || '2corners',
      } as CustomMapOverlay,
      embedSettings: {
        showHeader: rawProject.embedShowHeader ?? true,
        showBranding: rawProject.embedShowBranding ?? true,
      } as EmbedSettings,
    }
  }, [rawProject])

  // Fetch hotspots
  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots', rawProject?.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${rawProject!.id}/hotspots`)
      if (!res.ok) throw new Error('Failed to fetch hotspots')
      return res.json() as Promise<Hotspot[]>
    },
    enabled: !!rawProject?.id,
  })

  if (projectLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  if (projectError || !rawProject || !project) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Map not found</p>
          <p className="text-sm text-gray-400 mt-1">Check that the access code is correct</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Minimal header - conditionally rendered */}
      {project.embedSettings.showHeader && (
        <div className="bg-emerald-600 px-4 py-2 flex items-center justify-between">
          <span className="text-white font-medium text-sm">{rawProject.resortName}</span>
          <span className="text-emerald-100 text-xs">{hotspots.length} spots</span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <LeafletMap
          hotspots={hotspots}
          userLocation={null}
          boundaries={project.boundaries}
          customOverlay={project.customMapOverlay}
          onHotspotClick={setSelectedHotspot}
        />
      </div>

      {/* Powered by badge - conditionally rendered */}
      {project.embedSettings.showBranding && (
        <a
          href="https://wandernest.app"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2c-2.8 0-5 2.2-5 5 0 .5.1.9.2 1.3l4.8 11.5 4.8-11.5c.1-.4.2-.8.2-1.3 0-2.8-2.2-5-5-5z" />
          </svg>
          Powered by Wandernest
        </a>
      )}

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
