'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GroundControlPoint, CalibrationMode } from '@/lib/db/schema'

// Import Leaflet.ImageOverlay.Rotated plugin for 3-corner mode
import 'leaflet-imageoverlay-rotated'

interface CalibrationPreviewProps {
  imageUrl: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  } | null
  opacity: number
  venueCenter: { lat: number; lng: number }
  gcps: GroundControlPoint[]
  calibrationMode?: CalibrationMode
}

export default function CalibrationPreview({
  imageUrl,
  bounds,
  opacity,
  venueCenter,
  gcps,
  calibrationMode = '2corners',
}: CalibrationPreviewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<L.ImageOverlay | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite')
  const [showOverlay, setShowOverlay] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  // Helper function to get 3 corner anchors from GCPs for 3-corner mode
  // Returns [topLeft, topRight, bottomLeft] for L.imageOverlay.rotated
  const getThreeCornerAnchors = useCallback((): { topLeft: L.LatLng; topRight: L.LatLng; bottomLeft: L.LatLng } | null => {
    // For 3-corner mode: GCPs are already placed at Top-Left, Top-Right, Bottom-Left
    if (calibrationMode === '3corners' && gcps.length >= 3) {
      const [topLeft, topRight, bottomLeft] = gcps
      return {
        topLeft: L.latLng(topLeft.latitude, topLeft.longitude),
        topRight: L.latLng(topRight.latitude, topRight.longitude),
        bottomLeft: L.latLng(bottomLeft.latitude, bottomLeft.longitude),
      }
    }
    return null
  }, [gcps, calibrationMode])

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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const center = bounds
      ? [(bounds.north + bounds.south) / 2, (bounds.east + bounds.west) / 2] as [number, number]
      : [venueCenter.lat, venueCenter.lng] as [number, number]

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 16,
      zoomControl: false,
    })

    tileLayerRef.current = L.tileLayer(tileLayers.satellite.url, {
      attribution: tileLayers.satellite.attribution,
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [venueCenter])

  // Update tile layer
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return
    tileLayerRef.current.setUrl(tileLayers[mapLayer].url)
  }, [mapLayer])

  // Update overlay when bounds or opacity changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Remove existing overlay
    if (overlayRef.current) {
      overlayRef.current.remove()
      overlayRef.current = null
    }

    // Add new overlay if bounds exist and showOverlay is true
    if (bounds && showOverlay) {
      // For 3-corner mode: use L.imageOverlay.rotated which supports rotation/skew
      const threeCorners = getThreeCornerAnchors()

      if (threeCorners && calibrationMode === '3corners') {
        // Use rotated overlay for 3-corner mode (supports rotation)
        if (typeof (L as any).imageOverlay?.rotated === 'function') {
          overlayRef.current = (L as any).imageOverlay.rotated(
            imageUrl,
            threeCorners.topLeft,
            threeCorners.topRight,
            threeCorners.bottomLeft,
            {
              opacity,
              interactive: false,
            }
          ).addTo(mapRef.current)
        } else {
          // Fallback to simple bounds if rotated not available
          console.warn('L.imageOverlay.rotated not available, falling back to simple bounds')
          const imageBounds: L.LatLngBoundsExpression = [
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ]
          overlayRef.current = L.imageOverlay(imageUrl, imageBounds, {
            opacity,
            interactive: false,
          }).addTo(mapRef.current)
        }
      } else {
        // Use simple axis-aligned bounds for 2-corner mode
        const imageBounds: L.LatLngBoundsExpression = [
          [bounds.south, bounds.west],
          [bounds.north, bounds.east],
        ]

        overlayRef.current = L.imageOverlay(imageUrl, imageBounds, {
          opacity,
          interactive: false,
        }).addTo(mapRef.current)
      }

      // Fit map to bounds
      const imageBounds: L.LatLngBoundsExpression = [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ]
      mapRef.current.fitBounds(imageBounds, { padding: [20, 20] })
    }
  }, [bounds, opacity, imageUrl, showOverlay, mapReady, calibrationMode, getThreeCornerAnchors])

  // Update GCP markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add GCP markers (green)
    gcps.forEach((gcp, index) => {
      const marker = L.marker([gcp.latitude, gcp.longitude], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #10B981;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">${index + 1}</div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(mapRef.current!)

      if (gcp.label) {
        marker.bindTooltip(gcp.label)
      }

      markersRef.current.push(marker)
    })
  }, [gcps, mapReady])

  if (!bounds) {
    const requiredPoints = calibrationMode === '2corners' ? 2 : 3
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Add {requiredPoints} reference points to preview</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: '350px' }}>
      <div ref={mapContainerRef} className="absolute inset-0 rounded-lg" />

      {/* Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        {/* Map Layer Toggle */}
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

        {/* Overlay Toggle */}
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className={`px-3 py-2 text-xs font-medium rounded-lg shadow-md transition-colors ${
            showOverlay
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-xs text-gray-600 z-[1000]">
        <div>Preview: Custom map overlaid on {mapLayer} map</div>
        <div className="text-gray-400">Green markers show reference points</div>
      </div>
    </div>
  )
}
