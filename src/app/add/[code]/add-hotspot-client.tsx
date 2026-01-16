'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Camera, CheckCircle, AlertCircle, Loader2, Navigation, Plus } from 'lucide-react'
import { useGeolocation } from '@/hooks/use-geolocation'

interface TokenInfo {
  valid: boolean
  projectId: number
  projectName: string
  accessCode: string
  expiresAt: string
  error?: string
}

interface AddHotspotClientProps {
  code: string
  token?: string
}

type ViewState = 'validating' | 'invalid' | 'form' | 'uploading' | 'success'

export function AddHotspotClient({ code, token }: AddHotspotClientProps) {
  const [viewState, setViewState] = useState<ViewState>('validating')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Geolocation
  const { location, error: geoError, isLoading: geoLoading, retry: retryGeo } = useGeolocation()
  const latitude = location?.coords.latitude
  const longitude = location?.coords.longitude
  const accuracy = location?.coords.accuracy

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError('No token provided. Please scan a valid QR code.')
        setViewState('invalid')
        return
      }

      try {
        const res = await fetch(`/api/tokens/${token}`)
        const data = await res.json()

        if (!res.ok || !data.valid) {
          setError(data.error || 'Invalid or expired token')
          setViewState('invalid')
          return
        }

        // Verify the access code matches
        if (data.accessCode.toUpperCase() !== code.toUpperCase()) {
          setError('Token does not match this project')
          setViewState('invalid')
          return
        }

        setTokenInfo(data)
        setViewState('form')
      } catch {
        setError('Failed to validate token')
        setViewState('invalid')
      }
    }

    validateToken()
  }, [token, code])

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setImageUrl(data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setUploadError('Please enter a title')
      return
    }

    if (!latitude || !longitude) {
      setUploadError('Location not available')
      return
    }

    setViewState('uploading')

    try {
      const res = await fetch(`/api/projects/${tokenInfo?.projectId}/hotspots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          latitude,
          longitude,
          imageUrl: imageUrl || null,
          token,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create hotspot')
      }

      setViewState('success')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to create hotspot')
      setViewState('form')
    }
  }

  // Add another hotspot
  const handleAddAnother = () => {
    setTitle('')
    setImageUrl('')
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setViewState('form')
  }

  // Validating state
  if (viewState === 'validating') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Validating access...</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (viewState === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please request a new QR code from the portal.</p>
        </div>
      </div>
    )
  }

  // Success state
  if (viewState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Hotspot Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your hotspot has been submitted for review. It will appear on the map once approved in the portal.
          </p>
          <button
            onClick={handleAddAnother}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Hotspot
          </button>
        </div>
      </div>
    )
  }

  // Uploading state
  if (viewState === 'uploading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Submitting hotspot...</p>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">{tokenInfo?.projectName}</h1>
        <p className="text-sm text-gray-500">Add a new hotspot</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Location Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Navigation className="w-5 h-5 text-amber-600" />
            <span className="font-medium">Location</span>
          </div>

          {geoLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Getting your location...</span>
            </div>
          ) : geoError ? (
            <div className="space-y-2">
              <p className="text-sm text-red-600">{geoError}</p>
              <button
                type="button"
                onClick={retryGeo}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Retry
              </button>
            </div>
          ) : latitude && longitude ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
              </div>
              {accuracy && (
                <p className="text-xs text-gray-400 ml-6">
                  Accuracy: ~{Math.round(accuracy)}m
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Title Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <label htmlFor="title" className="block font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Main Pool, Restaurant Entrance"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
            required
          />
        </div>

        {/* Photo Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Camera className="w-5 h-5 text-amber-600" />
            <span className="font-medium">Photo</span>
            <span className="text-sm text-gray-400">(optional)</span>
          </div>

          {imageUrl ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <span className="sr-only">Remove photo</span>
                &times;
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50/50 transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                  <span className="text-sm text-gray-600">Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Tap to take or select a photo</span>
                </>
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Error */}
        {uploadError && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
            {uploadError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!title.trim() || !latitude || !longitude || isUploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <MapPin className="w-5 h-5" />
          Submit Hotspot
        </button>

        <p className="text-xs text-center text-gray-400">
          Hotspot will be submitted as a draft for review
        </p>
      </form>
    </div>
  )
}
