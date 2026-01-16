'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Hotspot, Boundaries, CustomMapOverlay, GroundControlPoint } from '@/lib/db/schema'

// Import Leaflet.ImageOverlay.Rotated plugin for 3-corner mode
import 'leaflet-imageoverlay-rotated'

// Declare the extended L.imageOverlay.rotated type for TypeScript
declare module 'leaflet' {
  namespace imageOverlay {
    function rotated(
      url: string,
      topLeft: L.LatLng,
      topRight: L.LatLng,
      bottomLeft: L.LatLng,
      options?: L.ImageOverlayOptions
    ): L.ImageOverlay
  }
}

// Fix default marker icon issue in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Marker shape SVGs with luxury styling
const MARKER_SHAPES = {
  pin: (color: string) => `
    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="marker-glow">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="${color}" stroke="#F5F0E6" stroke-width="1.5" filter="url(#glow)"/>
      <circle cx="12" cy="9" r="2.5" fill="#F5F0E6"/>
    </svg>
  `,
  circle: (color: string) => `
    <div style="width:26px;height:26px;background:${color};border:2.5px solid #F5F0E6;border-radius:50%;box-shadow:0 0 12px ${color}66, 0 2px 6px rgba(47,79,79,0.15);"></div>
  `,
  star: (color: string) => `
    <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="starGlow">
          <feGaussianBlur stdDeviation="1" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="${color}" stroke="#F5F0E6" stroke-width="1.5" filter="url(#starGlow)"/>
    </svg>
  `,
  diamond: (color: string) => `
    <div style="width:22px;height:22px;background:${color};border:2.5px solid #F5F0E6;transform:rotate(45deg);box-shadow:0 0 12px ${color}66, 0 2px 6px rgba(47,79,79,0.15);border-radius:3px;"></div>
  `,
}

interface LeafletMapProps {
  hotspots: Hotspot[]
  userLocation: GeolocationPosition | null
  boundaries?: Boundaries | null
  customOverlay?: CustomMapOverlay | null
  onHotspotClick: (hotspot: Hotspot) => void
}

export default function LeafletMap({
  hotspots,
  userLocation,
  boundaries,
  customOverlay,
  onHotspotClick,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const userPulseRef = useRef<L.CircleMarker | null>(null)
  const overlayRef = useRef<L.ImageOverlay | null>(null)
  const onHotspotClickRef = useRef(onHotspotClick)

  // Keep callback ref updated
  useEffect(() => {
    onHotspotClickRef.current = onHotspotClick
  }, [onHotspotClick])

  // Create custom marker icon
  const createMarkerIcon = useCallback((hotspot: Hotspot) => {
    const color = hotspot.markerColor || '#3B82F6'
    const shape = (hotspot.markerType || 'pin') as keyof typeof MARKER_SHAPES

    if (hotspot.customMarkerUrl) {
      return L.icon({
        iconUrl: hotspot.customMarkerUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })
    }

    const html = MARKER_SHAPES[shape](color)
    return L.divIcon({
      className: 'custom-marker',
      html,
      iconSize: [36, 36],
      iconAnchor: shape === 'pin' ? [18, 36] : [18, 18],
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Determine initial center
    let center: [number, number] = [51.0850, -2.4880] // Default: The Newt in Somerset
    let zoom = 15

    if (userLocation) {
      center = [userLocation.coords.latitude, userLocation.coords.longitude]
      zoom = 16
    } else if (boundaries?.north && boundaries?.south && boundaries?.east && boundaries?.west) {
      center = [
        (boundaries.north + boundaries.south) / 2,
        (boundaries.east + boundaries.west) / 2,
      ]
    }

    // Create map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    })

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    // Fit to boundaries if available
    if (boundaries?.north && boundaries?.south && boundaries?.east && boundaries?.west) {
      map.fitBounds([
        [boundaries.south, boundaries.west],
        [boundaries.north, boundaries.east],
      ])
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // Only run once on mount

  // Update hotspot markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    hotspots.forEach((hotspot) => {
      const marker = L.marker([hotspot.latitude, hotspot.longitude], {
        icon: createMarkerIcon(hotspot),
        interactive: true,
      })
        .addTo(mapRef.current!)

      // Use direct DOM click handler for more reliable click detection
      const iconElement = marker.getElement()
      if (iconElement) {
        iconElement.addEventListener('click', (e) => {
          e.stopPropagation()
          console.log('Marker clicked:', hotspot.title)
          onHotspotClickRef.current(hotspot)
        })
      }

      // Add permanent label if enabled
      if (hotspot.showLabelOnMap) {
        marker.bindTooltip(hotspot.title, {
          permanent: true,
          direction: 'right',
          offset: [10, 0],
          className: 'marker-label',
        })
      }

      markersRef.current.push(marker)
    })
  }, [hotspots, createMarkerIcon])

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing user markers
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }
    if (userPulseRef.current) {
      userPulseRef.current.remove()
      userPulseRef.current = null
    }

    if (userLocation) {
      const { latitude, longitude } = userLocation.coords

      // Pulse effect (larger, semi-transparent) - Forest Green
      userPulseRef.current = L.circleMarker([latitude, longitude], {
        radius: 20,
        fillColor: '#2F4F4F',
        fillOpacity: 0.2,
        stroke: false,
      }).addTo(mapRef.current)

      // Main user marker - Forest Green with Light Sand border
      userMarkerRef.current = L.circleMarker([latitude, longitude], {
        radius: 8,
        fillColor: '#2F4F4F',
        fillOpacity: 1,
        color: '#F5F0E6',
        weight: 2.5,
      }).addTo(mapRef.current)
    }
  }, [userLocation])

  // Helper function to get 3 corner anchors from GCPs for 3-corner mode
  // Returns { topLeft, topRight, bottomLeft } for L.imageOverlay.rotated
  const getThreeCornerAnchors = useCallback((gcps: GroundControlPoint[], calibrationMode: string): { topLeft: L.LatLng; topRight: L.LatLng; bottomLeft: L.LatLng } | null => {
    // For 3-corner mode: GCPs are placed at Top-Left, Top-Right, Bottom-Left
    if (calibrationMode === '3corners' && gcps.length >= 3) {
      const [topLeft, topRight, bottomLeft] = gcps
      return {
        topLeft: L.latLng(topLeft.latitude, topLeft.longitude),
        topRight: L.latLng(topRight.latitude, topRight.longitude),
        bottomLeft: L.latLng(bottomLeft.latitude, bottomLeft.longitude),
      }
    }
    return null
  }, [])

  // Update custom map overlay
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing overlay
    if (overlayRef.current) {
      overlayRef.current.remove()
      overlayRef.current = null
    }

    // Add new overlay if enabled and configured
    if (
      customOverlay?.enabled &&
      customOverlay?.imageUrl &&
      customOverlay?.northLat != null &&
      customOverlay?.southLat != null &&
      customOverlay?.westLng != null &&
      customOverlay?.eastLng != null
    ) {
      const opacity = customOverlay.opacity ?? 1.0
      const calibrationMode = customOverlay.calibrationMode || '2corners'
      const gcps = customOverlay.gcps || []

      // For 3-corner mode: use L.imageOverlay.rotated which supports rotation/skew
      const threeCorners = getThreeCornerAnchors(gcps, calibrationMode)

      if (threeCorners && calibrationMode === '3corners') {
        // Use rotated overlay for 3-corner mode (supports rotation)
        overlayRef.current = L.imageOverlay.rotated(
          customOverlay.imageUrl,
          threeCorners.topLeft,
          threeCorners.topRight,
          threeCorners.bottomLeft,
          {
            opacity,
            interactive: false,
          }
        ).addTo(mapRef.current)
      } else {
        // Use simple axis-aligned bounds for 2-corner mode
        const bounds: L.LatLngBoundsExpression = [
          [customOverlay.southLat, customOverlay.westLng], // Southwest
          [customOverlay.northLat, customOverlay.eastLng], // Northeast
        ]

        overlayRef.current = L.imageOverlay(customOverlay.imageUrl, bounds, {
          opacity,
          interactive: false,
          alt: 'Custom venue map overlay',
        }).addTo(mapRef.current)
      }

      // Ensure overlay is below markers
      overlayRef.current.bringToBack()
    }
  }, [customOverlay, getThreeCornerAnchors])

  // Center on user location
  const centerOnUser = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView(
        [userLocation.coords.latitude, userLocation.coords.longitude],
        16
      )
    }
  }, [userLocation])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Center on user button */}
      {userLocation && (
        <button
          onClick={centerOnUser}
          className="absolute bottom-24 right-3 z-[1000] bg-[#F5F0E6] text-[#2F4F4F] rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300"
          aria-label="Center on my location"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>
      )}

    </div>
  )
}
