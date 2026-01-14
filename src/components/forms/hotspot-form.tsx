'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'
import { MediaUpload } from '@/components/forms/media-upload'
import { isDemoMode } from '@/lib/mock-data'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Hotspot, OptionalField } from '@/lib/db/schema'

const LocationPicker = dynamic(
  () => import('@/components/map/location-picker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
)

const MARKER_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Teal', value: '#14B8A6' },
]

const MARKER_TYPES = [
  { name: 'Pin', value: 'pin' },
  { name: 'Circle', value: 'circle' },
  { name: 'Star', value: 'star' },
  { name: 'Diamond', value: 'diamond' },
]

// Marker shape previews
const MarkerPreview = ({ shape, color }: { shape: string; color: string }) => {
  switch (shape) {
    case 'pin':
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="9" r="2.5" fill="white" />
        </svg>
      )
    case 'circle':
      return (
        <div
          style={{
            width: 32,
            height: 32,
            background: color,
            border: '3px solid white',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      )
    case 'star':
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
      )
    case 'diamond':
      return (
        <div
          style={{
            width: 28,
            height: 28,
            background: color,
            border: '3px solid white',
            transform: 'rotate(45deg)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      )
    default:
      return null
  }
}

// Common emojis for hotspot fields
const EMOJI_OPTIONS = [
  // Activities & Places
  '🏠', '🏡', '🏢', '🏨', '🏪', '🏛️', '⛪', '🏰',
  '🌳', '🌲', '🌴', '🌺', '🌻', '🍎', '🍇', '🌾',
  // Food & Drink
  '🍽️', '☕', '🍷', '🍺', '🍕', '🍔', '🥗', '🍰',
  // Activities
  '🥾', '🚶', '🏊', '🚴', '⛷️', '🎣', '🏌️', '🎾',
  // Time & Info
  '⏰', '📅', '📍', '📞', '✉️', '💰', '🎫', '🅿️',
  // Nature & Weather
  '☀️', '🌙', '⭐', '🌊', '🏔️', '🌅', '🌈', '❄️',
  // Services
  '💆', '🛁', '🛏️', '📶', '🔌', '🚗', '🚌', '✈️',
  // Symbols
  '✅', '❤️', '⚠️', 'ℹ️', '🔒', '♿', '🐕', '👶',
]

// Emoji picker component
const EmojiPicker = ({
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  value: string
  onChange: (emoji: string) => void
  isOpen: boolean
  onToggle: () => void
}) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-16 h-10 px-3 py-2 border rounded-lg text-center text-xl hover:bg-gray-50"
      >
        {value || '😀'}
      </button>
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-white border rounded-lg shadow-lg p-2 w-64">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji)
                  onToggle()
                }}
                className="w-7 h-7 text-lg hover:bg-gray-100 rounded flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface HotspotFormProps {
  hotspot?: Hotspot
  mode: 'create' | 'edit'
}

export function HotspotForm({ hotspot, mode }: HotspotFormProps) {
  const router = useRouter()
  const { project } = useProject()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState(hotspot?.title || '')
  const [description, setDescription] = useState(hotspot?.description || '')
  const [latitude, setLatitude] = useState(hotspot?.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(hotspot?.longitude?.toString() || '')
  const [imageUrl, setImageUrl] = useState(hotspot?.imageUrl || '')
  const [audioUrl, setAudioUrl] = useState(hotspot?.audioUrl || '')
  const [markerColor, setMarkerColor] = useState(hotspot?.markerColor || '#3B82F6')
  const [markerType, setMarkerType] = useState(hotspot?.markerType || 'pin')
  const [optionalFields, setOptionalFields] = useState<OptionalField[]>(
    (hotspot?.optionalFields as OptionalField[]) || []
  )
  const [openEmojiPicker, setOpenEmojiPicker] = useState<number | null>(null)
  const [showDemoModal, setShowDemoModal] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data: Partial<Hotspot>) => {
      const url = mode === 'create'
        ? `/api/projects/${project!.id}/hotspots`
        : `/api/hotspots/${hotspot!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save hotspot')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots', project?.id] })
      router.push('/portal')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isDemoMode()) {
      setShowDemoModal(true)
      return
    }

    mutation.mutate({
      title,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
      markerColor,
      markerType,
      optionalFields,
    })
  }

  const addOptionalField = () => {
    setOptionalFields([...optionalFields, { icon: '', title: '', subtitle: '' }])
  }

  const updateOptionalField = (index: number, field: Partial<OptionalField>) => {
    const updated = [...optionalFields]
    updated[index] = { ...updated[index], ...field }
    setOptionalFields(updated)
  }

  const removeOptionalField = (index: number) => {
    setOptionalFields(optionalFields.filter((_, i) => i !== index))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString())
          setLongitude(position.coords.longitude.toString())
        },
        (error) => {
          alert('Could not get location: ' + error.message)
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Main Lodge"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe this hotspot..."
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Location</h3>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Use Current Location
          </button>
        </div>

        {/* Map Picker */}
        <LocationPicker
          latitude={latitude ? parseFloat(latitude) : null}
          longitude={longitude ? parseFloat(longitude) : null}
          onLocationSelect={(lat, lng) => {
            setLatitude(lat.toFixed(6))
            setLongitude(lng.toFixed(6))
          }}
          defaultCenter={
            project?.boundaries?.north && project?.boundaries?.south && project?.boundaries?.east && project?.boundaries?.west
              ? {
                  lat: (project.boundaries.north + project.boundaries.south) / 2,
                  lng: (project.boundaries.east + project.boundaries.west) / 2,
                }
              : undefined
          }
          markerColor={markerColor}
          markerType={markerType}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="45.5495"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="-121.136"
            />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">Media</h3>

        <MediaUpload
          type="image"
          label="Image"
          value={imageUrl}
          onChange={setImageUrl}
        />

        <MediaUpload
          type="audio"
          label="Audio"
          value={audioUrl}
          onChange={setAudioUrl}
        />
      </div>

      {/* Marker Style */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">Marker Style</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {MARKER_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setMarkerColor(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  markerColor === color.value
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape
          </label>
          <div className="flex flex-wrap gap-2">
            {MARKER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setMarkerType(type.value)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  markerType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Marker Preview */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500 mb-2">Preview</p>
          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
            <MarkerPreview shape={markerType} color={markerColor} />
          </div>
        </div>
      </div>

      {/* Optional Fields */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Optional Fields</h3>
          <button
            type="button"
            onClick={addOptionalField}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Field
          </button>
        </div>

        {optionalFields.length === 0 ? (
          <p className="text-sm text-gray-500">
            Add custom fields like hours, pricing, or contact info.
          </p>
        ) : (
          <div className="space-y-3">
            {optionalFields.map((field, index) => (
              <div key={index} className="flex gap-2 items-start">
                <EmojiPicker
                  value={field.icon}
                  onChange={(emoji) => updateOptionalField(index, { icon: emoji })}
                  isOpen={openEmojiPicker === index}
                  onToggle={() => setOpenEmojiPicker(openEmojiPicker === index ? null : index)}
                />
                <input
                  type="text"
                  value={field.title}
                  onChange={(e) => updateOptionalField(index, { title: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={field.subtitle}
                  onChange={(e) => updateOptionalField(index, { subtitle: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Subtitle"
                />
                <button
                  type="button"
                  onClick={() => removeOptionalField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Hotspot' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/portal')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      {mutation.isError && (
        <p className="text-red-600 text-sm">
          Error: {mutation.error.message}
        </p>
      )}

      {/* Demo Mode Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>This is a Demo</DialogTitle>
            <DialogDescription>
              You cannot save hotspots in demo mode. Sign up to create your own Wandernest and start building interactive experiences for your guests.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
