'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'
import { useSmartLocation } from '@/hooks/use-smart-location'
import { useProximity } from '@/hooks/use-proximity'
import { formatDistance } from '@/lib/utils/haversine'
import { cacheManager } from '@/lib/cache/indexeddb'
import { isDemoMode, DEMO_HOTSPOTS } from '@/lib/mock-data'
import type { Hotspot } from '@/lib/db/schema'
import { HotspotModal } from '@/components/modals/hotspot-modal'
import { SimpleHotspotModal } from '@/components/modals/simple-hotspot-modal'

// Dynamic import for Leaflet (no SSR)
const LeafletMap = dynamic(
  () => import('./leaflet-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#F5F0E6] animate-pulse flex items-center justify-center">
        <div className="text-[#708090]">Loading map...</div>
      </div>
    ),
  }
)

export function MapContainer() {
  const { project, isLoading: projectLoading } = useProject()
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [openedByProximity, setOpenedByProximity] = useState(false)
  const [showNearbyOnly, setShowNearbyOnly] = useState(false)

  const [isOffline, setIsOffline] = useState(false)

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    setIsOffline(!navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch hotspots with offline cache support
  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots', project?.id],
    queryFn: async () => {
      const projectId = project!.id

      // Return demo hotspots if in demo mode
      if (isDemoMode()) {
        return DEMO_HOTSPOTS
      }

      try {
        // Try to fetch from network
        const res = await fetch(`/api/projects/${projectId}/hotspots`)
        if (!res.ok) throw new Error('Failed to fetch hotspots')
        const data = await res.json() as Hotspot[]

        // Cache the result for offline use
        await cacheManager.cacheHotspots(projectId, data)

        return data
      } catch (error) {
        // If network fails, try to get from cache
        console.log('Network failed, trying cache...')
        const cached = await cacheManager.getCachedHotspots<Hotspot>(projectId)
        if (cached) {
          console.log('Using cached hotspots from', new Date(cached.timestamp).toLocaleString())
          return cached.data
        }
        throw error
      }
    },
    enabled: !!project?.id,
    retry: false, // Don't retry if offline, just use cache
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  })

  // Smart location with mock support when far from venue
  const {
    latitude,
    longitude,
    error: gpsError,
    isLoading: gpsLoading,
    isMockLocation,
    distanceToVenue,
    retry: retryGps,
  } = useSmartLocation({
    venueLocation: project?.venueLocation || null,
    boundaries: project?.boundaries || null,
  })

  // Create a location object compatible with the existing code
  const location = latitude && longitude ? {
    coords: {
      latitude,
      longitude,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  } as GeolocationPosition : null

  // Proximity detection
  const {
    hotspotsWithDistance,
    nearestHotspot,
    proximityHotspot,
    getNearbyHotspots,
  } = useProximity(hotspots, location)

  // Auto-open modal when in proximity (interactive mode)
  useEffect(() => {
    if (project?.mapExperience === 'interactive' && proximityHotspot && !selectedHotspot) {
      setSelectedHotspot(proximityHotspot)
      setOpenedByProximity(true)
    }
  }, [proximityHotspot, project?.mapExperience, selectedHotspot])

  // Handle manual tap on hotspot
  const handleHotspotTap = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot)
    setOpenedByProximity(false)
  }

  // Handle modal close
  const handleModalClose = () => {
    setSelectedHotspot(null)
    setOpenedByProximity(false)
  }

  // Filter hotspots if showing nearby only
  const displayedHotspots = showNearbyOnly
    ? getNearbyHotspots(500)
    : hotspotsWithDistance.length > 0
    ? hotspotsWithDistance
    : hotspots

  // In interactive mode: proximity opens full modal, tap opens simple modal
  // In full mode: always use full modal
  const Modal = project?.mapExperience === 'interactive'
    ? (openedByProximity ? HotspotModal : SimpleHotspotModal)
    : HotspotModal

  if (projectLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F0E6]">
        <div className="text-[#708090]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-[#2F4F4F] text-[#F5F0E6] px-4 py-2 text-sm text-center">
          You&apos;re offline - using cached data
        </div>
      )}

      {/* Header */}
      <header className="bg-[#F5F0E6] border-b border-[#2F4F4F]/10 px-4 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-bold text-lg text-[#2F4F4F]">{project?.resortName || 'Wandernest'}</h1>
          {nearestHotspot ? (
            <p className="text-sm text-[#708090]">
              Nearest: {nearestHotspot.title} ({formatDistance(nearestHotspot.distance)})
            </p>
          ) : (
            <p className="text-sm text-[#708090]">Discover amazing spots around you</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {location && (
            <button
              onClick={() => setShowNearbyOnly(!showNearbyOnly)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 font-medium ${
                showNearbyOnly
                  ? 'bg-[#2F4F4F] text-[#F5F0E6]'
                  : 'bg-white/60 text-[#2F4F4F] hover:bg-white border border-[#2F4F4F]/10'
              }`}
            >
              {showNearbyOnly ? 'Showing Nearby' : 'Show Nearby'}
            </button>
          )}
          <Link
            href="/portal"
            className="px-4 py-2 text-sm bg-white/60 text-[#2F4F4F] hover:bg-white rounded-full transition-all duration-300 border border-[#2F4F4F]/10 font-medium"
          >
            Portal
          </Link>
        </div>
      </header>

      {/* GPS Error Banner */}
      {gpsError && (
        <div className="bg-[#FFD27F]/20 border-b border-[#FFD27F]/40 px-4 py-2 text-sm text-[#2F4F4F] flex items-center justify-between">
          <span>{gpsError}</span>
          <button
            onClick={retryGps}
            className="ml-4 px-3 py-1 bg-[#FFD27F] hover:bg-[#f5c55a] rounded-full text-[#2F4F4F] font-medium transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* GPS Loading */}
      {gpsLoading && !gpsError && (
        <div className="bg-[#2F4F4F]/5 border-b border-[#2F4F4F]/10 px-4 py-2 text-sm text-[#2F4F4F]">
          Getting your location...
        </div>
      )}

      {/* Mock Location Indicator */}
      {isMockLocation && (
        <div className="bg-[#2F4F4F]/5 border-b border-[#2F4F4F]/10 px-4 py-2 text-sm text-[#2F4F4F] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FFD27F] rounded-full animate-pulse" />
            Demo mode - Using venue location
            {distanceToVenue && (
              <span className="text-[#708090]">
                (You&apos;re {formatDistance(distanceToVenue)} away)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <LeafletMap
          hotspots={displayedHotspots}
          userLocation={location}
          boundaries={project?.boundaries}
          customOverlay={project?.customMapOverlay}
          onHotspotClick={handleHotspotTap}
        />

        {/* Go to Nearest Button - only in full mode */}
        {nearestHotspot && project?.mapExperience !== 'interactive' && (
          <button
            onClick={() => setSelectedHotspot(nearestHotspot)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-[#2F4F4F] text-[#F5F0E6] px-6 py-3.5 rounded-full shadow-xl hover:bg-[#3a5f5f] transition-all duration-300 flex items-center gap-2 font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Go to Nearest
          </button>
        )}
      </div>

      {/* Hotspot Modal */}
      {selectedHotspot && (
        <Modal
          hotspot={selectedHotspot}
          isOpen={!!selectedHotspot}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
