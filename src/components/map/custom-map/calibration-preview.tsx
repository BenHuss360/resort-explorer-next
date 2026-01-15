'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GroundControlPoint, CalibrationMode } from '@/lib/db/schema'
import { calculateAffineTransform, imageToGPS } from '@/lib/utils/affine-transform'

// Import Leaflet.imageTransform plugin
import 'leaflet-imagetransform/src/L.ImageTransform.js'

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

  // Helper function to get 4 corner anchors from GCPs
  const getCornerAnchors = useCallback((): L.LatLngExpression[] | null => {
    // For 4-corner mode: use GCPs directly as anchors (user clicks on actual corners)
    // For GCPs mode: use affine transform to compute corner coordinates
    if (calibrationMode === 'corners' && gcps.length === 4) {
      // In 4-corner mode, assume user clicked: top-left, top-right, bottom-right, bottom-left
      // Use their GPS positions directly as anchors
      console.log('4-corner mode: using GCP positions directly as anchors')
      return [
        [gcps[0].latitude, gcps[0].longitude], // top-left
        [gcps[1].latitude, gcps[1].longitude], // top-right
        [gcps[2].latitude, gcps[2].longitude], // bottom-right
        [gcps[3].latitude, gcps[3].longitude], // bottom-left
      ]
    }

    if (calibrationMode === 'gcps' && gcps.length >= 3) {
      try {
        // For GCPs mode, use affine transform to compute where image corners should be
        const matrix = calculateAffineTransform(gcps)
        const topLeft = imageToGPS(0, 0, matrix)
        const topRight = imageToGPS(1, 0, matrix)
        const bottomRight = imageToGPS(1, 1, matrix)
        const bottomLeft = imageToGPS(0, 1, matrix)

        return [
          [topLeft.lat, topLeft.lng],
          [topRight.lat, topRight.lng],
          [bottomRight.lat, bottomRight.lng],
          [bottomLeft.lat, bottomLeft.lng],
        ]
      } catch (error) {
        console.error('Error computing anchors:', error)
        return null
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
      // Try to use imageTransform for 4-corner or GCPs mode
      const anchors = getCornerAnchors()

      console.log('=== Overlay Creation ===')
      console.log('calibrationMode:', calibrationMode)
      console.log('anchors:', anchors)
      console.log('using imageTransform:', !!(anchors && (calibrationMode === 'corners' || calibrationMode === 'gcps')))

      if (anchors && (calibrationMode === 'corners' || calibrationMode === 'gcps')) {
        // Use imageTransform for proper perspective transformation
        console.log('Creating L.imageTransform with anchors:', anchors)
        console.log('L.imageTransform available:', typeof (L as any).imageTransform)

        if (typeof (L as any).imageTransform !== 'function') {
          console.error('L.imageTransform is not available! Falling back to bounds.')
          const imageBounds: L.LatLngBoundsExpression = [
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ]
          overlayRef.current = L.imageOverlay(imageUrl, imageBounds, {
            opacity,
            interactive: false,
          }).addTo(mapRef.current)
        } else {
          overlayRef.current = (L as any).imageTransform(imageUrl, anchors, {
            opacity,
            interactive: false,
          }).addTo(mapRef.current)
        }
      } else {
        // Fall back to simple axis-aligned bounds for 2-corner mode
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
  }, [bounds, opacity, imageUrl, showOverlay, mapReady, calibrationMode, getCornerAnchors])

  // Update GCP markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add GCP markers
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
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Add at least 3 reference points to preview</p>
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
