'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { GroundControlPoint, CalibrationMode } from '@/lib/db/schema'
import { GCPList } from './gcp-list'
import { calculateBoundsFromGCPs } from '@/lib/utils/affine-transform'

// Dynamic imports to avoid SSR issues with Leaflet
const ImagePointPicker = dynamic(() => import('./image-point-picker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />,
})

const MapPointPicker = dynamic(() => import('./map-point-picker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />,
})

const CalibrationPreview = dynamic(() => import('./calibration-preview'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />,
})

interface CustomMapCalibratorProps {
  imageUrl: string
  existingGCPs?: GroundControlPoint[]
  existingBounds?: {
    northLat: number | null
    southLat: number | null
    westLng: number | null
    eastLng: number | null
  }
  existingOpacity?: number
  venueCenter?: { lat: number; lng: number }
  onSave: (data: {
    gcps: GroundControlPoint[]
    bounds: { north: number; south: number; east: number; west: number }
    calibrationMode: CalibrationMode
    opacity: number
  }) => void
  onCancel: () => void
}

type Step = 'image' | 'map' | 'preview'

export default function CustomMapCalibrator({
  imageUrl,
  existingGCPs = [],
  existingBounds,
  existingOpacity = 0.8,
  venueCenter = { lat: 51.0958, lng: -2.5353 },
  onSave,
  onCancel,
}: CustomMapCalibratorProps) {
  const [gcps, setGCPs] = useState<GroundControlPoint[]>(existingGCPs)
  const [calibrationMode, setCalibrationMode] = useState<CalibrationMode>(
    existingGCPs.length > 4 ? 'gcps' : 'corners'
  )
  const [currentStep, setCurrentStep] = useState<Step>('image')
  const [pendingImagePoint, setPendingImagePoint] = useState<{ x: number; y: number } | null>(null)
  const [opacity, setOpacity] = useState(existingOpacity)
  const [showPreview, setShowPreview] = useState(false)
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null)

  // Labels for 4-corner mode
  const cornerLabels = ['Northwest', 'Northeast', 'Southeast', 'Southwest']

  const maxPoints = calibrationMode === 'corners' ? 4 : 20

  // Add a new GCP
  const addGCP = useCallback((imageX: number, imageY: number, lat: number, lng: number) => {
    const label = calibrationMode === 'corners'
      ? cornerLabels[gcps.length]
      : `Point ${gcps.length + 1}`

    const newGCP: GroundControlPoint = {
      id: `gcp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      imageX,
      imageY,
      latitude: lat,
      longitude: lng,
      label,
    }

    setGCPs(prev => [...prev, newGCP])
    setPendingImagePoint(null)
    setCurrentStep('image')
  }, [gcps.length, calibrationMode])

  // Remove a GCP
  const removeGCP = useCallback((id: string) => {
    setGCPs(prev => prev.filter(gcp => gcp.id !== id))
  }, [])

  // Clear all GCPs
  const clearAllGCPs = useCallback(() => {
    setGCPs([])
    setPendingImagePoint(null)
    setCurrentStep('image')
  }, [])

  // Handle image click
  const handleImageClick = useCallback((x: number, y: number) => {
    if (gcps.length >= maxPoints) return
    setPendingImagePoint({ x, y })
    setCurrentStep('map')
  }, [gcps.length, maxPoints])

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (pendingImagePoint) {
      addGCP(pendingImagePoint.x, pendingImagePoint.y, lat, lng)
    }
  }, [pendingImagePoint, addGCP])

  // Calculate bounds from GCPs
  const calculatedBounds = gcps.length >= 3 && imageNaturalSize
    ? calculateBoundsFromGCPs(gcps, imageNaturalSize.width, imageNaturalSize.height)
    : null

  // Check if we can save
  const canSave = calibrationMode === 'corners'
    ? gcps.length === 4
    : gcps.length >= 3

  // Handle save
  const handleSave = useCallback(() => {
    if (!calculatedBounds) return

    onSave({
      gcps,
      bounds: calculatedBounds,
      calibrationMode,
      opacity,
    })
  }, [gcps, calculatedBounds, calibrationMode, opacity, onSave])

  // Get instruction text
  const getInstructionText = () => {
    if (showPreview) {
      return 'Preview your custom map overlay. Adjust opacity as needed.'
    }

    if (currentStep === 'image') {
      if (gcps.length >= maxPoints) {
        return calibrationMode === 'corners'
          ? 'All 4 corners placed. Click Preview or Save.'
          : 'Maximum points reached. Click Preview or Save.'
      }

      const remaining = maxPoints - gcps.length
      return calibrationMode === 'corners'
        ? `Click the ${cornerLabels[gcps.length]} corner on your custom map (${remaining} remaining)`
        : `Click a reference point on your custom map (${gcps.length}/${maxPoints} placed)`
    }

    return 'Now click the same location on the satellite map'
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Calibrate Custom Map</h2>
            <p className="text-sm text-gray-500">{getInstructionText()}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 border-b flex items-center gap-4 shrink-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setCalibrationMode('corners')
                if (gcps.length > 4) {
                  setGCPs(gcps.slice(0, 4))
                }
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                calibrationMode === 'corners'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Simple (4 corners)
            </button>
            <button
              onClick={() => setCalibrationMode('gcps')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                calibrationMode === 'gcps'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Advanced (multiple points)
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Opacity:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-500 w-8">{Math.round(opacity * 100)}%</span>
          </div>
        </div>

        {/* Main Content - use explicit min-height for reliable sizing */}
        <div className="flex-1 min-h-0 overflow-hidden" style={{ minHeight: '400px' }}>
          {showPreview ? (
            <div className="h-full p-4">
              <CalibrationPreview
                imageUrl={imageUrl}
                bounds={calculatedBounds}
                opacity={opacity}
                venueCenter={venueCenter}
                gcps={gcps}
              />
            </div>
          ) : (
            <div className="h-full flex">
              {/* Left: Custom Image */}
              <div className="flex-1 min-w-0 h-full p-4 border-r flex flex-col">
                <h3 className="text-sm font-medium text-gray-700 mb-2 shrink-0">
                  Your Custom Map
                  {currentStep === 'image' && gcps.length < maxPoints && (
                    <span className="text-blue-600 ml-2">Click here first</span>
                  )}
                </h3>
                <div
                  className={`flex-1 rounded-lg overflow-hidden border-2 relative ${
                    currentStep === 'image' && gcps.length < maxPoints
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                  style={{ minHeight: '300px' }}
                >
                  <ImagePointPicker
                    imageUrl={imageUrl}
                    gcps={gcps}
                    pendingPoint={pendingImagePoint}
                    onClick={currentStep === 'image' ? handleImageClick : undefined}
                    onImageLoad={setImageNaturalSize}
                  />
                </div>
              </div>

              {/* Right: Real Map */}
              <div className="flex-1 min-w-0 h-full p-4 flex flex-col">
                <h3 className="text-sm font-medium text-gray-700 mb-2 shrink-0">
                  Satellite Map
                  {currentStep === 'map' && (
                    <span className="text-blue-600 ml-2">Click matching location</span>
                  )}
                </h3>
                <div
                  className={`flex-1 rounded-lg overflow-hidden border-2 relative ${
                    currentStep === 'map'
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                  style={{ minHeight: '300px' }}
                >
                  <MapPointPicker
                    gcps={gcps}
                    venueCenter={venueCenter}
                    onClick={currentStep === 'map' ? handleMapClick : undefined}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GCP List */}
        {!showPreview && gcps.length > 0 && (
          <div className="p-4 border-t shrink-0 max-h-40 overflow-y-auto">
            <GCPList
              gcps={gcps}
              onRemove={removeGCP}
              onClearAll={clearAllGCPs}
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between shrink-0 bg-gray-50">
          <div className="text-sm text-gray-500">
            {gcps.length} reference point{gcps.length !== 1 ? 's' : ''} placed
            {calibrationMode === 'corners' && gcps.length < 4 && (
              <span className="text-amber-600 ml-2">
                (need {4 - gcps.length} more)
              </span>
            )}
            {calibrationMode === 'gcps' && gcps.length < 3 && (
              <span className="text-amber-600 ml-2">
                (need at least {3 - gcps.length} more)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {pendingImagePoint && (
              <button
                onClick={() => {
                  setPendingImagePoint(null)
                  setCurrentStep('image')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
              >
                Cancel Point
              </button>
            )}

            <button
              onClick={() => setShowPreview(!showPreview)}
              disabled={!canSave}
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showPreview ? 'Edit Points' : 'Preview'}
            </button>

            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Calibration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
