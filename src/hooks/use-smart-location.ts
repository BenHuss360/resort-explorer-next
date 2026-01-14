'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useGeolocation } from './use-geolocation'
import type { VenueLocation } from '@/components/providers/project-provider'
import type { Boundaries } from '@/lib/db/schema'
import {
  getEffectiveVenueLocation,
  isFarFromVenue,
  getMockPosition,
  getDistanceToVenue,
} from '@/lib/location-settings'

interface SmartLocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  isLoading: boolean
  isMockLocation: boolean
  distanceToVenue: number | null
}

interface UseSmartLocationOptions {
  venueLocation: VenueLocation | null
  boundaries: Boundaries | null
  enabled?: boolean
}

/**
 * Smart location hook that automatically uses mock location when user is far from venue.
 * This allows testing/demo when not physically at the property.
 */
export function useSmartLocation({ venueLocation, boundaries, enabled = true }: UseSmartLocationOptions) {
  const { location: realLocation, error: geoError, isLoading: geoLoading, retry } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  })

  const [mockPosition, setMockPosition] = useState<{ latitude: number; longitude: number } | null>(null)

  // Get effective venue location (explicit or calculated from boundaries)
  const effectiveVenueLocation = useMemo(() => {
    return getEffectiveVenueLocation(venueLocation, boundaries)
  }, [venueLocation, boundaries])

  // Get real coordinates from geolocation
  const realCoords = useMemo(() => {
    if (!realLocation) return null
    return {
      latitude: realLocation.coords.latitude,
      longitude: realLocation.coords.longitude,
      accuracy: realLocation.coords.accuracy,
    }
  }, [realLocation])

  // Check if we should use mock location
  const shouldUseMock = useMemo(() => {
    if (!enabled || !effectiveVenueLocation || !realCoords) return false
    return isFarFromVenue(realCoords.latitude, realCoords.longitude, effectiveVenueLocation)
  }, [enabled, effectiveVenueLocation, realCoords])

  // Generate mock position when needed
  useEffect(() => {
    if (shouldUseMock && effectiveVenueLocation && !mockPosition) {
      setMockPosition(getMockPosition(effectiveVenueLocation))
    }
  }, [shouldUseMock, effectiveVenueLocation, mockPosition])

  // Periodically update mock position to simulate movement
  useEffect(() => {
    if (!shouldUseMock || !effectiveVenueLocation) return

    const interval = setInterval(() => {
      setMockPosition(getMockPosition(effectiveVenueLocation))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [shouldUseMock, effectiveVenueLocation])

  // Calculate distance to venue
  const distanceToVenue = useMemo(() => {
    if (!realCoords || !effectiveVenueLocation) return null
    return getDistanceToVenue(realCoords.latitude, realCoords.longitude, effectiveVenueLocation)
  }, [realCoords, effectiveVenueLocation])

  // Build the state
  const state: SmartLocationState = useMemo(() => {
    // If loading real location, show loading
    if (geoLoading && !realCoords) {
      return {
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        isLoading: true,
        isMockLocation: false,
        distanceToVenue: null,
      }
    }

    // If there's an error getting real location
    if (geoError && !realCoords) {
      // If we have venue location, we can still use mock
      if (effectiveVenueLocation) {
        const mock = mockPosition || getMockPosition(effectiveVenueLocation)
        return {
          latitude: mock.latitude,
          longitude: mock.longitude,
          accuracy: 10, // Fake accuracy
          error: null,
          isLoading: false,
          isMockLocation: true,
          distanceToVenue: null,
        }
      }

      return {
        latitude: null,
        longitude: null,
        accuracy: null,
        error: geoError,
        isLoading: false,
        isMockLocation: false,
        distanceToVenue: null,
      }
    }

    // If we should use mock (user is far from venue)
    if (shouldUseMock && mockPosition) {
      return {
        latitude: mockPosition.latitude,
        longitude: mockPosition.longitude,
        accuracy: 10, // Fake high accuracy
        error: null,
        isLoading: false,
        isMockLocation: true,
        distanceToVenue,
      }
    }

    // Use real location
    if (realCoords) {
      return {
        latitude: realCoords.latitude,
        longitude: realCoords.longitude,
        accuracy: realCoords.accuracy,
        error: null,
        isLoading: false,
        isMockLocation: false,
        distanceToVenue,
      }
    }

    // Fallback
    return {
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      isLoading: true,
      isMockLocation: false,
      distanceToVenue: null,
    }
  }, [geoLoading, geoError, realCoords, shouldUseMock, mockPosition, effectiveVenueLocation, distanceToVenue])

  // Force use of mock location (for testing)
  const forceMock = useCallback(() => {
    if (effectiveVenueLocation) {
      setMockPosition(getMockPosition(effectiveVenueLocation))
    }
  }, [effectiveVenueLocation])

  return {
    ...state,
    retry,
    forceMock,
    realLocation: realCoords, // Expose real location for debugging
  }
}
