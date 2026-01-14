'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GroundControlPoint } from '@/lib/db/schema'

interface MapPointPickerProps {
  gcps: GroundControlPoint[]
  venueCenter: { lat: number; lng: number }
  onClick?: (lat: number, lng: number) => void
}

export default function MapPointPicker({
  gcps,
  venueCenter,
  onClick,
}: MapPointPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite')
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  // Tile layer URLs
  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
  }

  // Create numbered marker icon
  const createMarkerIcon = useCallback((index: number) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3B82F6;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">${index + 1}</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [venueCenter.lat, venueCenter.lng],
      zoom: 16,
      zoomControl: false,
    })

    // Add initial tile layer
    tileLayerRef.current = L.tileLayer(tileLayers.satellite.url, {
      attribution: tileLayers.satellite.attribution,
      maxZoom: 19,
    }).addTo(map)

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Click handler
    if (onClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onClick(e.latlng.lat, e.latlng.lng)
      })
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [venueCenter, onClick])

  // Update tile layer when mapLayer changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return

    const layer = tileLayers[mapLayer]
    tileLayerRef.current.setUrl(layer.url)
  }, [mapLayer])

  // Update markers when GCPs change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    gcps.forEach((gcp, index) => {
      const marker = L.marker([gcp.latitude, gcp.longitude], {
        icon: createMarkerIcon(index),
      }).addTo(mapRef.current!)

      if (gcp.label) {
        marker.bindTooltip(gcp.label, {
          permanent: false,
          direction: 'right',
        })
      }

      markersRef.current.push(marker)
    })

    // Fit bounds if we have markers
    if (gcps.length > 0) {
      const bounds = L.latLngBounds(gcps.map(gcp => [gcp.latitude, gcp.longitude] as [number, number]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 })
    }
  }, [gcps, createMarkerIcon])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Layer Toggle */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mapLayer === 'satellite'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapLayer('street')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mapLayer === 'street'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Street
          </button>
        </div>
      </div>

      {/* Click indicator */}
      {onClick && (
        <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1.5 rounded text-xs text-gray-600 z-[1000]">
          Click to place point
        </div>
      )}
    </div>
  )
}
