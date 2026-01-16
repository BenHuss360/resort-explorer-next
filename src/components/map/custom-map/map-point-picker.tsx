'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GroundControlPoint, CalibrationMode } from '@/lib/db/schema'

interface MapPointPickerProps {
  gcps: GroundControlPoint[]
  venueCenter: { lat: number; lng: number }
  calibrationMode?: CalibrationMode
  onClick?: (lat: number, lng: number) => void
  onGCPDrag?: (id: string, lat: number, lng: number) => void
  showPendingIndicator?: boolean
  pendingPointNumber?: number
}

export default function MapPointPicker({
  gcps,
  venueCenter,
  calibrationMode = '2corners',
  onClick,
  onGCPDrag,
}: MapPointPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polygonRef = useRef<L.Polygon | null>(null)
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite')
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [mapReady, setMapReady] = useState(false)

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

  // Store onClick in a ref so map doesn't re-initialize when it changes
  const onClickRef = useRef(onClick)
  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  // Store onGCPDrag in a ref
  const onGCPDragRef = useRef(onGCPDrag)
  useEffect(() => {
    onGCPDragRef.current = onGCPDrag
  }, [onGCPDrag])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Prevent re-initialization if map already exists
    if (mapRef.current) return

    // Small delay to ensure container has dimensions
    const initTimer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return

      const container = mapContainerRef.current
      const rect = container.getBoundingClientRect()

      // Don't initialize if container has no size
      if (rect.width === 0 || rect.height === 0) {
        console.warn('MapPointPicker: Container has no size, delaying init')
        return
      }

      try {
        const map = L.map(container, {
          center: [venueCenter.lat, venueCenter.lng],
          zoom: 16,
          zoomControl: false,
          doubleClickZoom: false, // Disable zoom on double-click for calibration
        })

        // Add initial tile layer
        tileLayerRef.current = L.tileLayer(tileLayers.satellite.url, {
          attribution: tileLayers.satellite.attribution,
          maxZoom: 19,
        }).addTo(map)

        // Add zoom control to bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map)

        // Click handler - use ref so it always uses the current onClick
        map.on('click', (e: L.LeafletMouseEvent) => {
          if (onClickRef.current) {
            onClickRef.current(e.latlng.lat, e.latlng.lng)
          }
        })

        mapRef.current = map
        setMapReady(true)

        // Force a resize check after map is initialized
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)
      } catch (error) {
        console.error('Failed to initialize map:', error)
      }
    }, 50)

    return () => {
      clearTimeout(initTimer)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [venueCenter.lat, venueCenter.lng])

  // Update tile layer when mapLayer changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return

    const layer = tileLayers[mapLayer]
    tileLayerRef.current.setUrl(layer.url)
  }, [mapLayer])

  // Update markers when GCPs change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    gcps.forEach((gcp, index) => {
      const marker = L.marker([gcp.latitude, gcp.longitude], {
        icon: createMarkerIcon(index),
        draggable: !!onGCPDragRef.current,
      }).addTo(mapRef.current!)

      if (gcp.label) {
        marker.bindTooltip(gcp.label, {
          permanent: false,
          direction: 'right',
        })
      }

      // Add drag event handler
      marker.on('dragend', () => {
        if (onGCPDragRef.current) {
          const newPos = marker.getLatLng()
          onGCPDragRef.current(gcp.id, newPos.lat, newPos.lng)
        }
      })

      // Prevent map click from firing when interacting with markers
      // This is important when a pending point is being placed - clicking
      // on an existing marker to drag it shouldn't place the pending point
      marker.on('mousedown', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e)
      })
      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e)
      })

      markersRef.current.push(marker)
    })

    // Update polygon outline
    if (polygonRef.current) {
      polygonRef.current.remove()
      polygonRef.current = null
    }

    if (gcps.length >= 2 && mapRef.current) {
      let latLngs: [number, number][]

      // For 2-corner mode with 2 points, draw a rectangle
      if (calibrationMode === '2corners' && gcps.length === 2) {
        const [p1, p2] = gcps
        // Calculate all 4 corners of the rectangle
        latLngs = [
          [p1.latitude, p1.longitude], // Top-left (NW)
          [p1.latitude, p2.longitude], // Top-right (NE)
          [p2.latitude, p2.longitude], // Bottom-right (SE)
          [p2.latitude, p1.longitude], // Bottom-left (SW)
        ]
      } else {
        latLngs = gcps.map(gcp => [gcp.latitude, gcp.longitude] as [number, number])
      }

      polygonRef.current = L.polygon(latLngs, {
        color: 'rgba(59, 130, 246, 0.8)',
        fillColor: 'rgba(59, 130, 246, 0.15)',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: gcps.length < 3 && calibrationMode !== '2corners' ? '5, 5' : undefined,
      }).addTo(mapRef.current)

      // Ensure polygon is below markers
      polygonRef.current.bringToBack()
    }

    // Fit bounds if we have markers
    if (gcps.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(gcps.map(gcp => [gcp.latitude, gcp.longitude] as [number, number]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 })
    }
  }, [gcps, createMarkerIcon, mapReady, calibrationMode])

  // Handle container resize
  useEffect(() => {
    if (!mapContainerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    })

    resizeObserver.observe(mapContainerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className="absolute inset-0">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />

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

      {/* Loading state */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[500]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <div className="text-gray-500 text-sm">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  )
}
