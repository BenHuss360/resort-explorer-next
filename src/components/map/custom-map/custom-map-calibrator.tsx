'use client'

import { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { GroundControlPoint, CalibrationMode } from '@/lib/db/schema'
import { GCPList } from './gcp-list'
import { calculateBoundsFromGCPs } from '@/lib/utils/affine-transform'

// Help panel component
function HelpPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          <span className="font-medium text-blue-800">How calibration works</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          <div className="bg-white rounded-lg p-3 space-y-3">
            <p className="text-gray-700">
              Calibration aligns your custom map with real GPS coordinates so it displays correctly on the interactive map.
            </p>

            <div className="space-y-2">
              <p className="font-medium text-gray-800">The process:</p>
              <ol className="space-y-2 text-gray-600">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <span>Click a recognizable point on <strong>your custom map</strong> (left panel)</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <span>Click the <strong>same location</strong> on the <strong>satellite map</strong> (right panel)</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <span>Repeat until you have enough reference points, then preview</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="font-medium text-amber-800 mb-2">Tips for accurate calibration:</p>
            <ul className="space-y-1 text-amber-700 text-xs">
              <li className="flex gap-2">
                <span>•</span>
                <span>Choose points that are <strong>easy to identify</strong> on both maps (building corners, path intersections, distinctive features)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Spread your points <strong>across the entire map</strong>, not just in one area</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Use <strong>zoom controls</strong> on both panels for precise placement</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>If the preview looks skewed, remove points and try again with different locations</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// Step indicator component
function StepIndicator({ currentStep, gcpCount, maxPoints, isPreviewing }: {
  currentStep: 'image' | 'map' | 'preview'
  gcpCount: number
  maxPoints: number
  isPreviewing: boolean
}) {
  const steps = [
    { id: 'image', label: 'Mark on custom map', shortLabel: '1. Custom map' },
    { id: 'map', label: 'Match on satellite', shortLabel: '2. Satellite' },
    { id: 'preview', label: 'Preview result', shortLabel: '3. Preview' },
  ]

  const activeStep = isPreviewing ? 'preview' : currentStep
  const isComplete = gcpCount >= 3

  return (
    <div className="flex items-center gap-1 text-xs">
      {steps.map((step, index) => {
        const isActive = step.id === activeStep
        const isPast = (step.id === 'image' && (activeStep === 'map' || activeStep === 'preview')) ||
                       (step.id === 'map' && activeStep === 'preview')

        return (
          <div key={step.id} className="flex items-center">
            {index > 0 && (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 mx-1">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            )}
            <span className={`px-2 py-1 rounded ${
              isActive
                ? 'bg-blue-100 text-blue-700 font-medium'
                : isPast
                  ? 'text-green-600'
                  : 'text-gray-400'
            }`}>
              {step.shortLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

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
  existingOpacity = 1.0,
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
  const [showHelp, setShowHelp] = useState(!existingGCPs.length) // Show help by default for new calibrations

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

  // Handle dragging a marker on the custom map image
  const handleImageGCPDrag = useCallback((id: string, imageX: number, imageY: number) => {
    setGCPs(prev => prev.map(gcp =>
      gcp.id === id ? { ...gcp, imageX, imageY } : gcp
    ))
  }, [])

  // Handle dragging a marker on the satellite map
  const handleMapGCPDrag = useCallback((id: string, lat: number, lng: number) => {
    setGCPs(prev => prev.map(gcp =>
      gcp.id === id ? { ...gcp, latitude: lat, longitude: lng } : gcp
    ))
  }, [])

  // Calculate bounds from GCPs (with error handling for collinear points)
  const { calculatedBounds, boundsError } = useMemo(() => {
    if (gcps.length < 3 || !imageNaturalSize) {
      return { calculatedBounds: null, boundsError: null }
    }
    try {
      const bounds = calculateBoundsFromGCPs(gcps, imageNaturalSize.width, imageNaturalSize.height)
      return { calculatedBounds: bounds, boundsError: null }
    } catch (error) {
      // Points are likely collinear
      return { calculatedBounds: null, boundsError: 'Points are in a straight line. Adjust marker positions.' }
    }
  }, [gcps, imageNaturalSize])

  // Check if we can save
  const canSave = calibrationMode === 'corners'
    ? gcps.length === 4 && calculatedBounds !== null
    : gcps.length >= 3 && calculatedBounds !== null

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

  // Get instruction text with more helpful context
  const getInstructionText = () => {
    if (showPreview) {
      return {
        main: 'Preview your calibration',
        sub: 'Check that your custom map aligns with the satellite view. Adjust opacity to see both layers clearly.',
      }
    }

    if (currentStep === 'image') {
      if (gcps.length >= maxPoints) {
        return {
          main: calibrationMode === 'corners' ? 'All 4 corners placed!' : 'All points placed!',
          sub: 'Click "Preview" to check alignment, or "Save" if you\'re satisfied.',
        }
      }

      if (calibrationMode === 'corners') {
        const cornerName = cornerLabels[gcps.length]
        return {
          main: `Step 1: Click the ${cornerName} corner`,
          sub: `Find the ${cornerName.toLowerCase()} corner on your custom map and click it. (${maxPoints - gcps.length} of 4 remaining)`,
        }
      } else {
        return {
          main: `Step 1: Click a reference point on your map`,
          sub: gcps.length === 0
            ? 'Choose a feature you can also find on the satellite map (building corner, path intersection, etc.)'
            : `${gcps.length} of ${maxPoints} points placed. ${gcps.length < 3 ? `Need at least ${3 - gcps.length} more.` : 'You can add more for better accuracy.'}`,
        }
      }
    }

    return {
      main: 'Step 2: Click the same spot on the satellite map',
      sub: 'Find the exact same location on the satellite view. Zoom in for precision.',
    }
  }

  const instructions = getInstructionText()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Calibrate Custom Map</h2>
              <StepIndicator
                currentStep={currentStep}
                gcpCount={gcps.length}
                maxPoints={maxPoints}
                isPreviewing={showPreview}
              />
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

          {/* Current instruction */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="font-medium text-gray-800">{instructions.main}</p>
            <p className="text-sm text-gray-500 mt-1">{instructions.sub}</p>
          </div>

          {/* Collapsible help panel */}
          <HelpPanel isOpen={showHelp} onToggle={() => setShowHelp(!showHelp)} />
        </div>

        {/* Mode Toggle */}
        <div className="p-4 border-b flex items-center gap-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Mode:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setCalibrationMode('corners')
                  if (gcps.length > 4) {
                    setGCPs(gcps.slice(0, 4))
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  calibrationMode === 'corners'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Best for rectangular maps. Mark the 4 corners."
              >
                4 Corners
              </button>
              <button
                onClick={() => setCalibrationMode('gcps')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  calibrationMode === 'gcps'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="For irregular maps. Use any identifiable points."
              >
                Multiple Points
              </button>
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline">
              {calibrationMode === 'corners'
                ? '(Best for rectangular maps)'
                : '(For irregular or non-rectangular maps)'}
            </span>
          </div>

          <div className="flex-1" />

          {showPreview && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Overlay opacity:</label>
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
          )}
        </div>

        {/* Main Content - use explicit height for reliable sizing */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: '400px', height: '400px' }}>
          {showPreview ? (
            <div className="w-full h-full p-4">
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
                <h3 className="text-sm font-medium text-gray-700 mb-2 shrink-0 flex items-center gap-2">
                  <span>Your Custom Map</span>
                  {currentStep === 'image' && gcps.length < maxPoints && (
                    <span className="text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
                      Click here
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">Scroll to zoom, drag to pan</span>
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
                    onGCPDrag={handleImageGCPDrag}
                  />
                </div>
              </div>

              {/* Right: Real Map */}
              <div className="flex-1 min-w-0 h-full p-4 flex flex-col">
                <h3 className="text-sm font-medium text-gray-700 mb-2 shrink-0 flex items-center gap-2">
                  <span>Satellite Map</span>
                  {currentStep === 'map' && (
                    <span className="text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
                      Click matching location
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">Scroll to zoom, drag to pan</span>
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
                    onGCPDrag={handleMapGCPDrag}
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
            {boundsError && (
              <span className="text-red-600 ml-2 font-medium">
                {boundsError}
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
