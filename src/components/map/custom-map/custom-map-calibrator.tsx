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
function StepIndicator({ currentStep, isPreviewing }: {
  currentStep: 'image' | 'map' | 'preview'
  isPreviewing: boolean
}) {
  const steps = [
    { id: 'image', label: 'Mark on custom map', shortLabel: '1. Custom map' },
    { id: 'map', label: 'Match on satellite', shortLabel: '2. Satellite' },
    { id: 'preview', label: 'Preview result', shortLabel: '3. Preview' },
  ]

  const activeStep = isPreviewing ? 'preview' : currentStep

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

// Wizard component to help choose the right calibration mode
function CalibrationWizard({ onComplete }: { onComplete: (mode: CalibrationMode) => void }) {
  const [step, setStep] = useState<'north' | 'scale' | 'result'>('north')
  const [isNorthAligned, setIsNorthAligned] = useState<boolean | null>(null)
  const [isToScale, setIsToScale] = useState<boolean | null>(null)

  const handleNorthAnswer = (answer: boolean | null) => {
    setIsNorthAligned(answer)
    setStep('scale')
  }

  const handleScaleAnswer = (answer: boolean | null) => {
    setIsToScale(answer)
    setStep('result')
  }

  const getRecommendedMode = (): { mode: CalibrationMode; reason: string } => {
    // If not north-aligned, need 3-corner mode for rotation
    if (isNorthAligned === false) {
      return {
        mode: '3corners',
        reason: 'Your map needs rotation support, so we\'ll use 3-corner calibration.',
      }
    }
    // If north-aligned but not to scale, might need more control
    if (isToScale === false) {
      return {
        mode: '3corners',
        reason: 'Since your map may not be perfectly to scale, 3-corner mode gives better control.',
      }
    }
    // Default: 2-corner is simplest for standard maps
    return {
      mode: '2corners',
      reason: 'For a standard north-aligned map, 2-corner mode is the simplest option.',
    }
  }

  const { mode, reason } = getRecommendedMode()

  return (
    <div className="p-6 space-y-6">
      {step === 'north' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Is your map aligned north?</h3>
          <p className="text-sm text-gray-600">
            Most printed maps have north at the top. If your map is rotated or has a different orientation, let us know.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleNorthAnswer(true)}
              className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition-colors"
            >
              Yes, north is up
            </button>
            <button
              onClick={() => handleNorthAnswer(false)}
              className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
            >
              No, it&apos;s rotated
            </button>
            <button
              onClick={() => handleNorthAnswer(null)}
              className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium transition-colors"
            >
              Not sure
            </button>
          </div>
        </div>
      )}

      {step === 'scale' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Is your map drawn to scale?</h3>
          <p className="text-sm text-gray-600">
            Some maps are stylized or simplified. If distances aren&apos;t proportionally accurate, we can handle that.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleScaleAnswer(true)}
              className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition-colors"
            >
              Yes, it&apos;s accurate
            </button>
            <button
              onClick={() => handleScaleAnswer(false)}
              className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
            >
              No, it&apos;s stylized
            </button>
            <button
              onClick={() => handleScaleAnswer(null)}
              className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium transition-colors"
            >
              Not sure
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Recommended: {mode === '2corners' ? '2 Corners' : mode === '3corners' ? '3 Corners' : 'Multiple Points'}
            </h3>
            <p className="text-sm text-green-700">{reason}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onComplete(mode)}
              className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Use recommended mode
            </button>
            <button
              onClick={() => onComplete('2corners')}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              2 Corners
            </button>
            <button
              onClick={() => onComplete('3corners')}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              3 Corners
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            You can change modes later if needed
          </p>
        </div>
      )}
    </div>
  )
}

export default function CustomMapCalibrator({
  imageUrl,
  existingGCPs = [],
  existingBounds: _existingBounds,
  existingOpacity = 1.0,
  venueCenter = { lat: 51.0958, lng: -2.5353 },
  onSave,
  onCancel,
}: CustomMapCalibratorProps) {
  const [gcps, setGCPs] = useState<GroundControlPoint[]>(existingGCPs)
  const [calibrationMode, setCalibrationMode] = useState<CalibrationMode>(
    existingGCPs.length > 3 ? 'gcps' : existingGCPs.length > 2 ? '3corners' : '2corners'
  )
  const [currentStep, setCurrentStep] = useState<Step>('image')
  const [pendingImagePoint, setPendingImagePoint] = useState<{ x: number; y: number } | null>(null)
  const [opacity, setOpacity] = useState(existingOpacity)
  const [showPreview, setShowPreview] = useState(false)
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [showHelp, setShowHelp] = useState(!existingGCPs.length) // Show help by default for new calibrations
  const [showWizard, setShowWizard] = useState(!existingGCPs.length) // Show wizard for new calibrations

  // Labels for corner modes - memoized to avoid recreating on every render
  const cornerLabels = useMemo(() =>
    calibrationMode === '2corners'
      ? ['Top-Left', 'Bottom-Right']
      : calibrationMode === '3corners'
        ? ['Top-Left', 'Top-Right', 'Bottom-Left']
        : ['Point 1', 'Point 2', 'Point 3', 'Point 4']
  , [calibrationMode])

  const maxPoints = calibrationMode === '2corners' ? 2 : calibrationMode === '3corners' ? 3 : 20

  // Add a new GCP
  const addGCP = useCallback((imageX: number, imageY: number, lat: number, lng: number) => {
    const label = (calibrationMode === '3corners' || calibrationMode === '2corners')
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
  }, [gcps.length, calibrationMode, cornerLabels])

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
    // 2-corner mode: simple direct calculation
    if (calibrationMode === '2corners') {
      if (gcps.length < 2) {
        return { calculatedBounds: null, boundsError: null }
      }
      const [p1, p2] = gcps
      return {
        calculatedBounds: {
          north: Math.max(p1.latitude, p2.latitude),
          south: Math.min(p1.latitude, p2.latitude),
          east: Math.max(p1.longitude, p2.longitude),
          west: Math.min(p1.longitude, p2.longitude),
        },
        boundsError: null,
      }
    }

    // 3-corner mode: calculate 4th corner and compute bounding box
    if (calibrationMode === '3corners') {
      if (gcps.length < 3) {
        return { calculatedBounds: null, boundsError: null }
      }
      // GCPs are: Top-Left, Top-Right, Bottom-Left
      // Calculate Bottom-Right as: BR = TR - TL + BL
      const [topLeft, topRight, bottomLeft] = gcps
      const bottomRight = {
        latitude: topRight.latitude - topLeft.latitude + bottomLeft.latitude,
        longitude: topRight.longitude - topLeft.longitude + bottomLeft.longitude,
      }
      const allLats = [topLeft.latitude, topRight.latitude, bottomLeft.latitude, bottomRight.latitude]
      const allLngs = [topLeft.longitude, topRight.longitude, bottomLeft.longitude, bottomRight.longitude]
      return {
        calculatedBounds: {
          north: Math.max(...allLats),
          south: Math.min(...allLats),
          east: Math.max(...allLngs),
          west: Math.min(...allLngs),
        },
        boundsError: null,
      }
    }

    // GCPs mode: use affine transformation
    if (gcps.length < 3 || !imageNaturalSize) {
      return { calculatedBounds: null, boundsError: null }
    }
    try {
      const bounds = calculateBoundsFromGCPs(gcps, imageNaturalSize.width, imageNaturalSize.height)
      return { calculatedBounds: bounds, boundsError: null }
    } catch (_error) {
      // Points are likely collinear
      return { calculatedBounds: null, boundsError: 'Points are in a straight line. Adjust marker positions.' }
    }
  }, [gcps, imageNaturalSize, calibrationMode])

  // Check if we can save
  const canSave = calibrationMode === '2corners'
    ? gcps.length === 2 && calculatedBounds !== null
    : calibrationMode === '3corners'
      ? gcps.length === 3 && calculatedBounds !== null
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
        const modeLabel = calibrationMode === '2corners' ? 'Both corners' :
                         calibrationMode === '3corners' ? 'All 3 corners' : 'All points'
        return {
          main: `${modeLabel} placed!`,
          sub: 'Click "Preview" to check alignment, or "Save" if you\'re satisfied.',
        }
      }

      if (calibrationMode === '2corners') {
        const cornerName = cornerLabels[gcps.length]
        return {
          main: `Step 1: Click the ${cornerName} area`,
          sub: `Find a recognizable point in the ${cornerName.toLowerCase()} area of your map. (${gcps.length === 0 ? '2' : '1'} of 2 remaining)`,
        }
      } else if (calibrationMode === '3corners') {
        const cornerName = cornerLabels[gcps.length]
        return {
          main: `Step 1: Click the ${cornerName} area`,
          sub: `Find a recognizable point in the ${cornerName.toLowerCase()} area of your map. This mode supports rotation. (${maxPoints - gcps.length} of 3 remaining)`,
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

  // Handle wizard completion
  const handleWizardComplete = useCallback((mode: CalibrationMode) => {
    setCalibrationMode(mode)
    setShowWizard(false)
  }, [])

  // Show wizard for new calibrations
  if (showWizard) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-lg my-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Calibrate Custom Map</h2>
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
          <CalibrationWizard onComplete={handleWizardComplete} />
          <div className="p-4 border-t">
            <button
              onClick={() => setShowWizard(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip wizard and choose mode manually
            </button>
          </div>
        </div>
      </div>
    )
  }

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
                  if (calibrationMode !== '2corners') {
                    setCalibrationMode('2corners')
                    setGCPs([]) // Clear GCPs when switching modes to avoid label mismatch
                    setPendingImagePoint(null)
                    setCurrentStep('image')
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  calibrationMode === '2corners'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Simplest option. Mark opposite corners (top-left and bottom-right)."
              >
                2 Corners
              </button>
              <button
                onClick={() => {
                  if (calibrationMode !== '3corners') {
                    setCalibrationMode('3corners')
                    setGCPs([]) // Clear GCPs when switching modes to avoid label mismatch
                    setPendingImagePoint(null)
                    setCurrentStep('image')
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  calibrationMode === '3corners'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Mark 3 corners for rotated maps."
              >
                3 Corners
              </button>
              <button
                onClick={() => {
                  if (calibrationMode !== 'gcps') {
                    setCalibrationMode('gcps')
                    setGCPs([]) // Clear GCPs when switching modes to avoid label mismatch
                    setPendingImagePoint(null)
                    setCurrentStep('image')
                  }
                }}
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
              {calibrationMode === '2corners'
                ? '(Simplest - for rectangular maps)'
                : calibrationMode === '3corners'
                  ? '(For rotated maps)'
                  : '(For irregular maps)'}
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
                calibrationMode={calibrationMode}
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
                    calibrationMode={calibrationMode}
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
                    calibrationMode={calibrationMode}
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
            {calibrationMode === '2corners' && gcps.length < 2 && (
              <span className="text-amber-600 ml-2">
                (need {2 - gcps.length} more)
              </span>
            )}
            {calibrationMode === '3corners' && gcps.length < 3 && (
              <span className="text-amber-600 ml-2">
                (need {3 - gcps.length} more)
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
