'use client'

import { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import { calculateDistance } from '@/lib/utils/haversine'
import type { Hotspot } from '@/lib/db/schema'

interface HotspotWithDistance extends Hotspot {
  distance: number
}

export function useProximity(
  hotspots: Hotspot[],
  location: GeolocationPosition | null,
  proximityRadius: number = 30 // meters for auto-trigger
) {
  const triggeredRef = useRef<Set<number>>(new Set())
  const [proximityHotspot, setProximityHotspot] = useState<HotspotWithDistance | null>(null)

  // Calculate distances to all hotspots
  const hotspotsWithDistance = useMemo<HotspotWithDistance[]>(() => {
    if (!location || !hotspots.length) return []

    return hotspots
      .map((hotspot) => ({
        ...hotspot,
        distance: calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          hotspot.latitude,
          hotspot.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
  }, [hotspots, location])

  // Find nearest hotspot
  const nearestHotspot = useMemo(() => {
    return hotspotsWithDistance[0] || null
  }, [hotspotsWithDistance])

  // Find hotspot within proximity that hasn't been triggered yet
  // Using useEffect to avoid accessing refs during render
  useEffect(() => {
    if (!hotspotsWithDistance.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: updating derived state based on effect
      setProximityHotspot(null)
      return
    }

    for (const hotspot of hotspotsWithDistance) {
      if (hotspot.distance <= proximityRadius && !triggeredRef.current.has(hotspot.id)) {
        triggeredRef.current.add(hotspot.id)
        setProximityHotspot(hotspot)
        return
      }
    }

    setProximityHotspot(null)
  }, [hotspotsWithDistance, proximityRadius])

  // Reset a hotspot so it can trigger again
  const resetTrigger = useCallback((hotspotId: number) => {
    triggeredRef.current.delete(hotspotId)
  }, [])

  // Filter hotspots within a certain radius
  const getNearbyHotspots = useCallback(
    (radius: number = 500) => {
      return hotspotsWithDistance.filter((h) => h.distance <= radius)
    },
    [hotspotsWithDistance]
  )

  return {
    hotspotsWithDistance,
    nearestHotspot,
    proximityHotspot,
    resetTrigger,
    getNearbyHotspots,
  }
}
