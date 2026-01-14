'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Marker shape SVGs
const MARKER_SHAPES = {
  pin: (color: string) => `
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `,
  circle: (color: string) => `
    <div style="width:24px;height:24px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
  `,
  star: (color: string) => `
    <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>
  `,
  diamond: (color: string) => `
    <div style="width:20px;height:20px;background:${color};border:2px solid white;transform:rotate(45deg);box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
  `,
  home: (color: string) => `
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="11" fill="${color}" opacity="0.2"/>
    </svg>
  `,
}

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationSelect: (lat: number, lng: number) => void
  defaultCenter?: { lat: number; lng: number }
  markerColor?: string
  markerType?: string
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
  defaultCenter = { lat: 51.0958, lng: -2.5353 },
  markerColor = '#3B82F6',
  markerType = 'pin',
}: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Create custom marker icon
  const createMarkerIcon = useCallback((color: string, shape: string) => {
    const shapeKey = shape as keyof typeof MARKER_SHAPES
    const html = MARKER_SHAPES[shapeKey]?.(color) || MARKER_SHAPES.pin(color)
    return L.divIcon({
      className: 'custom-marker',
      html,
      iconSize: [32, 32],
      iconAnchor: shape === 'pin' ? [16, 32] : [16, 16],
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const center: [number, number] = latitude && longitude
      ? [latitude, longitude]
      : [defaultCenter.lat, defaultCenter.lng]

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 16,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add marker if location exists
    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude], {
        icon: createMarkerIcon(markerColor, markerType),
      }).addTo(map)
    }

    // Click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
        markerRef.current.setIcon(createMarkerIcon(markerColor, markerType))
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: createMarkerIcon(markerColor, markerType),
        }).addTo(map)
      }

      onLocationSelect(lat, lng)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, []) // Only run once

  // Update marker when coordinates change externally
  useEffect(() => {
    if (!mapRef.current) return

    if (latitude && longitude) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude])
        markerRef.current.setIcon(createMarkerIcon(markerColor, markerType))
      } else {
        markerRef.current = L.marker([latitude, longitude], {
          icon: createMarkerIcon(markerColor, markerType),
        }).addTo(mapRef.current)
      }
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom())
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [latitude, longitude])

  // Update marker style when color or type changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createMarkerIcon(markerColor, markerType))
    }
  }, [markerColor, markerType, createMarkerIcon])

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="w-full h-64 rounded-lg" />
      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 z-[1000]">
        Tap on the map to set location
      </div>
    </div>
  )
}
