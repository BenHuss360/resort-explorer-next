'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'
import { MOCK_DISTANCE_THRESHOLD } from '@/lib/location-settings'

// Dynamic import for map component (no SSR)
const VenueLocationPicker = dynamic(
  () => import('@/components/map/venue-location-picker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading map...</div>
      </div>
    ),
  }
)

// Embed Code Section - can be gated behind premium later
function EmbedCodeSection({ accessCode }: { accessCode?: string }) {
  const [embedSize, setEmbedSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [copied, setCopied] = useState(false)

  const sizes = {
    small: { width: 400, height: 500 },
    medium: { width: 600, height: 700 },
    large: { width: 800, height: 900 },
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const embedUrl = `${baseUrl}/embed/${accessCode}`
  const { width, height } = sizes[embedSize]

  const embedCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="geolocation"
  style="border-radius: 12px; border: 1px solid #e5e7eb;"
></iframe>`

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = embedCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Embed in Your Website</h3>
        <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-2 py-1 rounded-full font-medium">
          Coming Soon
        </span>
      </div>
      <p className="text-sm text-gray-500">
        Add the interactive map directly to your website or app. Copy the embed code below.
      </p>

      {/* Size Selector */}
      <div className="flex gap-2">
        {(['small', 'medium', 'large'] as const).map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setEmbedSize(size)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              embedSize === size
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {size.charAt(0).toUpperCase() + size.slice(1)}
            <span className="text-xs text-gray-400 ml-1">
              ({sizes[size].width}×{sizes[size].height})
            </span>
          </button>
        ))}
      </div>

      {/* Embed Code */}
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono">
          {embedCode}
        </pre>
        <button
          type="button"
          onClick={copyEmbedCode}
          className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-md transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        The embed will automatically use your venue location for remote guests.
      </p>
    </div>
  )
}

export default function PortalSettingsPage() {
  const { project, refreshProject } = useProject()
  const queryClient = useQueryClient()

  const [resortName, setResortName] = useState(project?.resortName || '')
  const [homepageContent, setHomepageContent] = useState(project?.homepageContent || '')
  const [mapExperience, setMapExperience] = useState<string>(project?.mapExperience || 'full')
  const [venueLocationLat, setVenueLocationLat] = useState<number | null>(
    project?.venueLocation?.latitude || null
  )
  const [venueLocationLng, setVenueLocationLng] = useState<number | null>(
    project?.venueLocation?.longitude || null
  )

  // Update state when project loads
  useEffect(() => {
    if (project) {
      setResortName(project.resortName || '')
      setHomepageContent(project.homepageContent || '')
      setMapExperience(project.mapExperience || 'full')
      setVenueLocationLat(project.venueLocation?.latitude || null)
      setVenueLocationLng(project.venueLocation?.longitude || null)
    }
  }, [project])

  const mutation = useMutation({
    mutationFn: async (data: {
      resortName: string
      homepageContent: string
      mapExperience: string
      venueLocationLat?: number | null
      venueLocationLng?: number | null
    }) => {
      const res = await fetch(`/api/projects/${project!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json()
    },
    onSuccess: () => {
      refreshProject()
      queryClient.invalidateQueries({ queryKey: ['project'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      resortName,
      homepageContent,
      mapExperience,
      venueLocationLat,
      venueLocationLng,
    })
  }

  const handleVenueLocationChange = (lat: number | null, lng: number | null) => {
    setVenueLocationLat(lat)
    setVenueLocationLng(lng)
  }

  const copyAccessCode = () => {
    navigator.clipboard.writeText(project?.accessCode || '')
    alert('Access code copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Access Code */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Access Code</h3>
        <div className="flex items-center gap-4">
          <code className="bg-gray-100 px-4 py-2 rounded-lg text-lg font-mono">
            {project?.accessCode}
          </code>
          <button
            onClick={copyAccessCode}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this code with guests so they can access your resort map.
        </p>
      </div>

      {/* Resort Settings */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Resort Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resort Name
            </label>
            <input
              type="text"
              value={resortName}
              onChange={(e) => setResortName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Message
            </label>
            <textarea
              value={homepageContent}
              onChange={(e) => setHomepageContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Welcome message shown to guests..."
            />
          </div>
        </div>

        {/* Venue Location */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Venue Location</h3>
          <p className="text-sm text-gray-500">
            Set your venue's location. Search for an address, click on the map, or use your current location.
            When guests are more than {MOCK_DISTANCE_THRESHOLD / 1000}km away, they'll see a simulated location at your venue so they can explore the map remotely.
          </p>

          <VenueLocationPicker
            latitude={venueLocationLat}
            longitude={venueLocationLng}
            onLocationChange={handleVenueLocationChange}
          />
        </div>

        {/* Map Experience */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Map Experience</h3>
          <p className="text-sm text-gray-500">
            Choose how guests interact with hotspots on the map.
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mapExperience"
                value="full"
                checked={mapExperience === 'full'}
                onChange={(e) => setMapExperience(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Full Experience</p>
                <p className="text-sm text-gray-500">
                  Guests tap markers to see detailed information with images, audio, and more.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mapExperience"
                value="interactive"
                checked={mapExperience === 'interactive'}
                onChange={(e) => setMapExperience(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Interactive Mode</p>
                <p className="text-sm text-gray-500">
                  Hotspots automatically open when guests are within 10 meters. Perfect for guided tours.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Embed Code - Future premium feature */}
        <EmbedCodeSection accessCode={project?.accessCode} />

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
          {mutation.isSuccess && (
            <span className="text-green-600 text-sm">Settings saved!</span>
          )}
          {mutation.isError && (
            <span className="text-red-600 text-sm">Error saving settings</span>
          )}
        </div>
      </form>
    </div>
  )
}
