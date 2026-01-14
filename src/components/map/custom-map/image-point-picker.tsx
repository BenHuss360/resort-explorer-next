'use client'

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import type { GroundControlPoint } from '@/lib/db/schema'

interface ImagePointPickerProps {
  imageUrl: string
  gcps: GroundControlPoint[]
  pendingPoint?: { x: number; y: number } | null
  onClick?: (x: number, y: number) => void
  onImageLoad?: (size: { width: number; height: number }) => void
}

interface ViewState {
  scale: number
  posX: number
  posY: number
}

export default function ImagePointPicker({
  imageUrl,
  gcps,
  pendingPoint,
  onClick,
  onImageLoad,
}: ImagePointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [view, setView] = useState<ViewState>({ scale: 1, posX: 0, posY: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null)

  // Monitor container size
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }

    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  // Reset view and preload image when URL changes
  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => {
    setView({ scale: 1, posX: 0, posY: 0 })
    setImageLoaded(false)
    setImageDimensions(null)
    setImageError(null)

    if (!imageUrl) {
      return
    }

    // Use JavaScript Image object to preload - more reliable than img element
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight }
      setImageDimensions(dims)
      setImageLoaded(true)
      setImageError(null)
      onImageLoad?.(dims)
    }

    img.onerror = () => {
      setImageError('Failed to load image')
      setImageLoaded(false)
    }

    img.src = imageUrl

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageUrl, onImageLoad])

  // Handle image load
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current
    if (img) {
      const dims = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      }
      setImageDimensions(dims)
      setImageLoaded(true)
      setImageError(null)
      onImageLoad?.(dims)
    }
  }, [onImageLoad])

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError('Failed to load image')
    setImageLoaded(false)
  }, [])

  // Calculate the displayed image size (fitted to container)
  const displaySize = useMemo(() => {
    if (!containerSize || !imageDimensions) return null

    const containerWidth = containerSize.width - 20
    const containerHeight = containerSize.height - 20

    if (containerWidth <= 0 || containerHeight <= 0) return null

    const imgAspect = imageDimensions.width / imageDimensions.height
    const containerAspect = containerWidth / containerHeight

    let displayWidth: number
    let displayHeight: number

    if (imgAspect > containerAspect) {
      displayWidth = containerWidth
      displayHeight = containerWidth / imgAspect
    } else {
      displayHeight = containerHeight
      displayWidth = containerHeight * imgAspect
    }

    return {
      width: displayWidth * view.scale,
      height: displayHeight * view.scale,
    }
  }, [containerSize, imageDimensions, view.scale])

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setView(prev => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * delta, 0.5), 5),
    }))
  }, [])

  // Handle mouse down for drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - view.posX, y: e.clientY - view.posY })
    }
  }, [view.posX, view.posY])

  // Handle mouse move for drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setView(prev => ({
        ...prev,
        posX: e.clientX - dragStart.x,
        posY: e.clientY - dragStart.y,
      }))
    }
  }, [isDragging, dragStart])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle click to place point
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!onClick || !containerRef.current || isDragging || !displaySize || !containerSize) return

    const container = containerRef.current.getBoundingClientRect()
    const containerX = e.clientX - container.left
    const containerY = e.clientY - container.top

    const imgX = (containerSize.width - displaySize.width) / 2 + view.posX
    const imgY = (containerSize.height - displaySize.height) / 2 + view.posY

    if (
      containerX >= imgX &&
      containerX <= imgX + displaySize.width &&
      containerY >= imgY &&
      containerY <= imgY + displaySize.height
    ) {
      const normalizedX = (containerX - imgX) / displaySize.width
      const normalizedY = (containerY - imgY) / displaySize.height
      onClick(normalizedX, normalizedY)
    }
  }, [onClick, displaySize, containerSize, view.posX, view.posY, isDragging])

  // Calculate marker position
  const getMarkerPosition = useCallback((gcp: GroundControlPoint) => {
    if (!displaySize || !containerSize) return null

    const imgX = (containerSize.width - displaySize.width) / 2 + view.posX
    const imgY = (containerSize.height - displaySize.height) / 2 + view.posY

    return {
      left: imgX + gcp.imageX * displaySize.width,
      top: imgY + gcp.imageY * displaySize.height,
    }
  }, [displaySize, containerSize, view.posX, view.posY])

  // Calculate pending marker position
  const pendingMarkerPos = useMemo(() => {
    if (!pendingPoint || !displaySize || !containerSize) return null

    const imgX = (containerSize.width - displaySize.width) / 2 + view.posX
    const imgY = (containerSize.height - displaySize.height) / 2 + view.posY

    return {
      left: imgX + pendingPoint.x * displaySize.width,
      top: imgY + pendingPoint.y * displaySize.height,
    }
  }, [pendingPoint, displaySize, containerSize, view.posX, view.posY])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-gray-800 select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      style={{ cursor: onClick ? (isDragging ? 'grabbing' : 'crosshair') : 'grab' }}
    >
      {/* Image - simplified for debugging */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Custom map"
          crossOrigin="anonymous"
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `translate(${view.posX}px, ${view.posY}px) scale(${view.scale})`,
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />
      </div>

      {/* GCP Markers */}
      {imageLoaded && gcps.map((gcp, index) => {
        const pos = getMarkerPosition(gcp)
        if (!pos) return null

        return (
          <div
            key={gcp.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: pos.left, top: pos.top }}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              {gcp.label && (
                <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {gcp.label}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Pending Point Marker */}
      {imageLoaded && pendingMarkerPos && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
          style={{ left: pendingMarkerPos.left, top: pendingMarkerPos.top }}
        >
          <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
            ?
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setView(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }))
          }}
          className="w-8 h-8 bg-white rounded shadow hover:bg-gray-50 flex items-center justify-center text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setView(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }))
          }}
          className="w-8 h-8 bg-white rounded shadow hover:bg-gray-50 flex items-center justify-center text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setView({ scale: 1, posX: 0, posY: 0 })
          }}
          className="w-8 h-8 bg-white rounded shadow hover:bg-gray-50 flex items-center justify-center text-gray-600 text-xs font-medium"
        >
          1:1
        </button>
      </div>

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <p className="text-red-600 text-sm font-medium">{imageError}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <div className="text-gray-500 text-sm">Loading image...</div>
          </div>
        </div>
      )}
    </div>
  )
}
