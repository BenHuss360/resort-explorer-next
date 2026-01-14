'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { GroundControlPoint } from '@/lib/db/schema'

interface ImagePointPickerProps {
  imageUrl: string
  gcps: GroundControlPoint[]
  pendingPoint?: { x: number; y: number } | null
  onClick?: (x: number, y: number) => void
  onImageLoad?: (size: { width: number; height: number }) => void
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
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setImageLoaded(true)
      onImageLoad?.({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      })
    }
  }, [onImageLoad])

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 5))
  }, [])

  // Handle mouse down for drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position])

  // Handle mouse move for drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle click to place point
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!onClick || !imageRef.current || !containerRef.current || isDragging) return

    const container = containerRef.current.getBoundingClientRect()
    const image = imageRef.current

    // Calculate click position relative to container
    const containerX = e.clientX - container.left
    const containerY = e.clientY - container.top

    // Calculate actual image position and size
    const imgDisplayWidth = image.naturalWidth * scale
    const imgDisplayHeight = image.naturalHeight * scale
    const imgX = (container.width - imgDisplayWidth) / 2 + position.x
    const imgY = (container.height - imgDisplayHeight) / 2 + position.y

    // Check if click is within image bounds
    if (
      containerX >= imgX &&
      containerX <= imgX + imgDisplayWidth &&
      containerY >= imgY &&
      containerY <= imgY + imgDisplayHeight
    ) {
      // Calculate normalized position (0-1)
      const normalizedX = (containerX - imgX) / imgDisplayWidth
      const normalizedY = (containerY - imgY) / imgDisplayHeight

      onClick(normalizedX, normalizedY)
    }
  }, [onClick, scale, position, isDragging])

  // Calculate marker position
  const getMarkerPosition = useCallback((gcp: GroundControlPoint) => {
    if (!imageRef.current || !containerRef.current) return null

    const container = containerRef.current.getBoundingClientRect()
    const image = imageRef.current

    const imgDisplayWidth = image.naturalWidth * scale
    const imgDisplayHeight = image.naturalHeight * scale
    const imgX = (container.width - imgDisplayWidth) / 2 + position.x
    const imgY = (container.height - imgDisplayHeight) / 2 + position.y

    return {
      left: imgX + gcp.imageX * imgDisplayWidth,
      top: imgY + gcp.imageY * imgDisplayHeight,
    }
  }, [scale, position])

  // Calculate pending marker position
  const getPendingMarkerPosition = useCallback(() => {
    if (!pendingPoint || !imageRef.current || !containerRef.current) return null

    const container = containerRef.current.getBoundingClientRect()
    const image = imageRef.current

    const imgDisplayWidth = image.naturalWidth * scale
    const imgDisplayHeight = image.naturalHeight * scale
    const imgX = (container.width - imgDisplayWidth) / 2 + position.x
    const imgY = (container.height - imgDisplayHeight) / 2 + position.y

    return {
      left: imgX + pendingPoint.x * imgDisplayWidth,
      top: imgY + pendingPoint.y * imgDisplayHeight,
    }
  }, [pendingPoint, scale, position])

  // Reset view when component mounts
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [imageUrl])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-900 select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      style={{ cursor: onClick ? (isDragging ? 'grabbing' : 'crosshair') : 'grab' }}
    >
      {/* Image */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Custom map"
          className="max-w-none"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          onLoad={handleImageLoad}
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
      {imageLoaded && pendingPoint && (() => {
        const pos = getPendingMarkerPosition()
        if (!pos) return null

        return (
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
            style={{ left: pos.left, top: pos.top }}
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              ?
            </div>
          </div>
        )
      })()}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setScale(prev => Math.min(prev * 1.2, 5))
          }}
          className="w-8 h-8 bg-white rounded shadow hover:bg-gray-50 flex items-center justify-center text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setScale(prev => Math.max(prev * 0.8, 0.5))
          }}
          className="w-8 h-8 bg-white rounded shadow hover:bg-gray-50 flex items-center justify-center text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setScale(1)
            setPosition({ x: 0, y: 0 })
          }}
          className="w-8 h-8 bg-white rounded shadow hover:bg-gray-50 flex items-center justify-center text-gray-600 text-xs font-medium"
        >
          1:1
        </button>
      </div>

      {/* Instructions overlay */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">Loading image...</div>
        </div>
      )}
    </div>
  )
}
