import type { Boundaries } from '@/lib/db/schema'
import type { VenueLocation } from '@/components/providers/project-provider'
import { calculateDistance } from '@/lib/utils/haversine'

export const MOCK_DISTANCE_THRESHOLD = 5000 // meters (5km - accommodates large properties)

/**
 * Calculate the center point of venue boundaries
 */
export function getVenueCenter(boundaries: Boundaries): { latitude: number; longitude: number } | null {
  if (!boundaries.north || !boundaries.south || !boundaries.east || !boundaries.west) {
    return null
  }
  return {
    latitude: (boundaries.north + boundaries.south) / 2,
    longitude: (boundaries.east + boundaries.west) / 2,
  }
}

/**
 * Get the venue location, preferring explicit venueLocation over calculated center
 */
export function getEffectiveVenueLocation(
  venueLocation: VenueLocation | null,
  boundaries: Boundaries | null
): { latitude: number; longitude: number } | null {
  // Prefer explicit venue location if set
  if (venueLocation?.latitude && venueLocation?.longitude) {
    return {
      latitude: venueLocation.latitude,
      longitude: venueLocation.longitude,
    }
  }

  // Fall back to calculated center from boundaries
  if (boundaries) {
    return getVenueCenter(boundaries)
  }

  return null
}

/**
 * Check if a position is far from the venue (>1000m from venue location)
 */
export function isFarFromVenue(
  userLat: number,
  userLng: number,
  venueLocation: { latitude: number; longitude: number }
): boolean {
  const distance = calculateDistance(userLat, userLng, venueLocation.latitude, venueLocation.longitude)
  return distance > MOCK_DISTANCE_THRESHOLD
}

/**
 * Get a mock position near the venue
 * Returns a position slightly offset from venue location to simulate movement
 */
export function getMockPosition(venueLocation: { latitude: number; longitude: number }): { latitude: number; longitude: number } {
  // Add small random offset to make it feel more natural
  const latOffset = (Math.random() - 0.5) * 0.0005 // ~50m variation
  const lngOffset = (Math.random() - 0.5) * 0.0005

  return {
    latitude: venueLocation.latitude + latOffset,
    longitude: venueLocation.longitude + lngOffset,
  }
}

/**
 * Get distance from user to venue location
 */
export function getDistanceToVenue(
  userLat: number,
  userLng: number,
  venueLocation: { latitude: number; longitude: number }
): number {
  return calculateDistance(userLat, userLng, venueLocation.latitude, venueLocation.longitude)
}
