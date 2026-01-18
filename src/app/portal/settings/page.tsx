'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'
import { MOCK_DISTANCE_THRESHOLD } from '@/lib/location-settings'
import type { GroundControlPoint, CalibrationMode } from '@/lib/db/schema'
import { BRAND_DEFAULTS } from '@/lib/db/schema'
import { GoogleFontsLoader } from '@/components/google-fonts-loader'
import { isDemoMode } from '@/lib/mock-data'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

// Dynamic import for custom map calibrator
const CustomMapCalibrator = dynamic(
  () => import('@/components/map/custom-map/custom-map-calibrator'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    ),
  }
)

// Section Header Component for grouping settings
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-6 pb-2 first:pt-0">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
        {children}
      </h3>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

// Embed Code Section - can be gated behind premium later
function EmbedCodeSection({
  slug,
  showHeader,
  showBranding,
  onShowHeaderChange,
  onShowBrandingChange,
}: {
  slug?: string
  showHeader: boolean
  showBranding: boolean
  onShowHeaderChange: (value: boolean) => void
  onShowBrandingChange: (value: boolean) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [embedSize, setEmbedSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [copiedIframe, setCopiedIframe] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')

  // Set baseUrl after mount to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: window.location only available on client
    setBaseUrl(window.location.origin)
  }, [])

  const sizes = {
    small: { width: 400, height: 500 },
    medium: { width: 600, height: 700 },
    large: { width: 800, height: 900 },
  }
  const embedUrl = `${baseUrl}/explore/${slug}`
  const { width, height } = sizes[embedSize]

  const embedCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="geolocation"
  style="border-radius: 12px; border: 1px solid #e5e7eb;"
></iframe>`

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          >
            <path d="m9 18 6-6-6-6"/>
          </svg>
          <h3 className="font-semibold">Embed & Integration</h3>
          <span className="text-xs bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 px-2 py-0.5 rounded-full font-medium">
            Premium
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-6 border-t">
          {/* Embed Display Settings */}
          <div className="pt-4 space-y-3">
            <p className="text-sm text-gray-500">
              Customize how your map appears when embedded in your website or mobile app.
            </p>

            <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-medium">Show Header Bar</p>
                <p className="text-sm text-gray-500">
                  Display the resort name and hotspot count at the top of the embed.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showHeader}
                onClick={() => onShowHeaderChange(!showHeader)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  showHeader ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition ${
                    showHeader ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-medium">Show WanderNest Branding</p>
                <p className="text-sm text-gray-500">
                  Display the &quot;Powered by WanderNest&quot; badge. Disable for white-label integration.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showBranding}
                onClick={() => onShowBrandingChange(!showBranding)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  showBranding ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition ${
                    showBranding ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>

          <hr className="border-gray-100" />

          {/* Direct URL for Mobile Apps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
              <span className="text-sm font-medium">Mobile App / WebView</span>
            </div>
            <p className="text-xs text-gray-500">
              Use this URL in your mobile app&apos;s WebView for fullscreen integration.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono text-gray-700 truncate">
                {embedUrl}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(embedUrl, setCopiedUrl)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedUrl ? (
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
          </div>

          <hr className="border-gray-100" />

          {/* Website Embed */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span className="text-sm font-medium">Website Embed</span>
            </div>
            <p className="text-xs text-gray-500">
              Add the interactive map to your website using this iframe code.
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
                onClick={() => copyToClipboard(embedCode, setCopiedIframe)}
                className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-md transition-colors flex items-center gap-1.5"
              >
                {copiedIframe ? (
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
          </div>

          <p className="text-xs text-gray-400">
            The embed will automatically use your venue location for remote guests.
          </p>
        </div>
      )}
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
  const [embedShowHeader, setEmbedShowHeader] = useState<boolean>(
    project?.embedSettings?.showHeader ?? true
  )
  const [embedShowBranding, setEmbedShowBranding] = useState<boolean>(
    project?.embedSettings?.showBranding ?? true
  )

  // Brand colors state
  const [brandPrimaryColor, setBrandPrimaryColor] = useState<string>(
    project?.brandColors?.primary || BRAND_DEFAULTS.primaryColor
  )
  const [brandSecondaryColor, setBrandSecondaryColor] = useState<string>(
    project?.brandColors?.secondary || BRAND_DEFAULTS.secondaryColor
  )

  // Brand fonts state
  const [brandPrimaryFont, setBrandPrimaryFont] = useState<string>(
    project?.brandFonts?.primary || BRAND_DEFAULTS.primaryFont
  )
  const [brandSecondaryFont, setBrandSecondaryFont] = useState<string>(
    project?.brandFonts?.secondary || BRAND_DEFAULTS.secondaryFont
  )

  // Custom map overlay state
  const [customMapImageUrl, setCustomMapImageUrl] = useState<string | null>(
    project?.customMapOverlay?.imageUrl || null
  )
  const [customMapEnabled, setCustomMapEnabled] = useState(
    project?.customMapOverlay?.enabled || false
  )
  const [customMapOpacity, setCustomMapOpacity] = useState(
    project?.customMapOverlay?.opacity ?? 1.0
  )
  const [customMapGCPs, setCustomMapGCPs] = useState<GroundControlPoint[]>(
    (project?.customMapOverlay?.gcps as GroundControlPoint[]) || []
  )
  const [customMapBounds, setCustomMapBounds] = useState<{
    northLat: number | null
    southLat: number | null
    westLng: number | null
    eastLng: number | null
  }>({
    northLat: project?.customMapOverlay?.northLat || null,
    southLat: project?.customMapOverlay?.southLat || null,
    westLng: project?.customMapOverlay?.westLng || null,
    eastLng: project?.customMapOverlay?.eastLng || null,
  })
  const [customMapCalibrationMode, setCustomMapCalibrationMode] = useState<CalibrationMode>(
    (project?.customMapOverlay?.calibrationMode as CalibrationMode) || 'corners'
  )
  const [showCalibrator, setShowCalibrator] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [customMapExpanded, setCustomMapExpanded] = useState(false)
  const [brandingExpanded, setBrandingExpanded] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update state when project loads
  useEffect(() => {
    if (project) {
      setResortName(project.resortName || '')
      setHomepageContent(project.homepageContent || '')
      setMapExperience(project.mapExperience || 'full')
      setVenueLocationLat(project.venueLocation?.latitude || null)
      setVenueLocationLng(project.venueLocation?.longitude || null)
      setEmbedShowHeader(project.embedSettings?.showHeader ?? true)
      setEmbedShowBranding(project.embedSettings?.showBranding ?? true)
      // Brand colors
      setBrandPrimaryColor(project.brandColors?.primary || BRAND_DEFAULTS.primaryColor)
      setBrandSecondaryColor(project.brandColors?.secondary || BRAND_DEFAULTS.secondaryColor)
      // Brand fonts
      setBrandPrimaryFont(project.brandFonts?.primary || BRAND_DEFAULTS.primaryFont)
      setBrandSecondaryFont(project.brandFonts?.secondary || BRAND_DEFAULTS.secondaryFont)
      // Custom map overlay
      setCustomMapImageUrl(project.customMapOverlay?.imageUrl || null)
      setCustomMapEnabled(project.customMapOverlay?.enabled || false)
      setCustomMapOpacity(project.customMapOverlay?.opacity ?? 1.0)
      setCustomMapGCPs((project.customMapOverlay?.gcps as GroundControlPoint[]) || [])
      setCustomMapBounds({
        northLat: project.customMapOverlay?.northLat || null,
        southLat: project.customMapOverlay?.southLat || null,
        westLng: project.customMapOverlay?.westLng || null,
        eastLng: project.customMapOverlay?.eastLng || null,
      })
      setCustomMapCalibrationMode(
        (project.customMapOverlay?.calibrationMode as CalibrationMode) || 'corners'
      )
    }
  }, [project])

  const mutation = useMutation({
    mutationFn: async (data: {
      resortName: string
      homepageContent: string
      mapExperience: string
      venueLocationLat?: number | null
      venueLocationLng?: number | null
      embedShowHeader?: boolean
      embedShowBranding?: boolean
      customMapImageUrl?: string | null
      customMapEnabled?: boolean
      customMapOpacity?: number
      customMapNorthLat?: number | null
      customMapSouthLat?: number | null
      customMapWestLng?: number | null
      customMapEastLng?: number | null
      customMapGCPs?: GroundControlPoint[]
      customMapCalibrationMode?: CalibrationMode
      brandPrimaryColor?: string
      brandSecondaryColor?: string
      brandPrimaryFont?: string
      brandSecondaryFont?: string
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

    if (isDemoMode()) {
      setShowDemoModal(true)
      return
    }

    mutation.mutate({
      resortName,
      homepageContent,
      mapExperience,
      venueLocationLat,
      venueLocationLng,
      embedShowHeader,
      embedShowBranding,
      customMapImageUrl,
      customMapEnabled,
      customMapOpacity,
      customMapNorthLat: customMapBounds.northLat,
      customMapSouthLat: customMapBounds.southLat,
      customMapWestLng: customMapBounds.westLng,
      customMapEastLng: customMapBounds.eastLng,
      customMapGCPs,
      customMapCalibrationMode,
      brandPrimaryColor,
      brandSecondaryColor,
      brandPrimaryFont,
      brandSecondaryFont,
    })
  }

  const handleVenueLocationChange = (lat: number | null, lng: number | null) => {
    setVenueLocationLat(lat)
    setVenueLocationLng(lng)
  }

  // Handle custom map file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isDemoMode()) {
      setShowDemoModal(true)
      // Reset input so user can try again after dismissing modal
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { url } = await res.json()
      setCustomMapImageUrl(url)
      // Clear any existing calibration when a new image is uploaded
      setCustomMapGCPs([])
      setCustomMapBounds({
        northLat: null,
        southLat: null,
        westLng: null,
        eastLng: null,
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  // Handle calibration save
  const handleCalibrationSave = useCallback((data: {
    gcps: GroundControlPoint[]
    bounds: { north: number; south: number; east: number; west: number }
    calibrationMode: CalibrationMode
    opacity: number
  }) => {
    setCustomMapGCPs(data.gcps)
    setCustomMapBounds({
      northLat: data.bounds.north,
      southLat: data.bounds.south,
      westLng: data.bounds.west,
      eastLng: data.bounds.east,
    })
    setCustomMapCalibrationMode(data.calibrationMode)
    setCustomMapOpacity(data.opacity)
    setShowCalibrator(false)
  }, [])

  // Remove custom map
  const handleRemoveCustomMap = useCallback(() => {
    setCustomMapImageUrl(null)
    setCustomMapEnabled(false)
    setCustomMapGCPs([])
    setCustomMapBounds({
      northLat: null,
      southLat: null,
      westLng: null,
      eastLng: null,
    })
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Resort Settings */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===== IDENTITY & APPEARANCE ===== */}
        <SectionHeader>Identity & Appearance</SectionHeader>

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

        {/* Branding */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <button
            type="button"
            onClick={() => setBrandingExpanded(!brandingExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform ${brandingExpanded ? 'rotate-90' : ''}`}
              >
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <h3 className="font-semibold">Branding</h3>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border border-gray-200"
                style={{ backgroundColor: brandPrimaryColor }}
                title="Primary color"
              />
              <div
                className="w-5 h-5 rounded-full border border-gray-200"
                style={{ backgroundColor: brandSecondaryColor }}
                title="Secondary color"
              />
            </div>
          </button>

          {brandingExpanded && (
            <div className="px-6 pb-6 space-y-6 border-t">
              <p className="text-sm text-gray-500 pt-4">
                Customize the colors and fonts used in your guest-facing map experience.
              </p>

              {/* Colors Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Colors</h4>

                {/* Primary Color */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Primary Color
                    <span className="text-xs text-gray-400 ml-2">Headers, buttons</span>
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Forest', value: '#2F4F4F' },
                        { name: 'Navy', value: '#1E3A5F' },
                        { name: 'Burgundy', value: '#722F37' },
                        { name: 'Charcoal', value: '#36454F' },
                        { name: 'Teal', value: '#008080' },
                        { name: 'Slate', value: '#708090' },
                        { name: 'Emerald', value: '#065F46' },
                        { name: 'Indigo', value: '#4338CA' },
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setBrandPrimaryColor(color.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            brandPrimaryColor === color.value
                              ? 'border-gray-900 scale-110'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={brandPrimaryColor}
                      onChange={(e) => setBrandPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      title="Custom color"
                    />
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {brandPrimaryColor}
                    </code>
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Secondary Color
                    <span className="text-xs text-gray-400 ml-2">Accents, highlights</span>
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Gold', value: '#FFD27F' },
                        { name: 'Coral', value: '#FF6B6B' },
                        { name: 'Sage', value: '#87A96B' },
                        { name: 'Terracotta', value: '#C4A484' },
                        { name: 'Copper', value: '#B87333' },
                        { name: 'Rose', value: '#E8A0A0' },
                        { name: 'Amber', value: '#F59E0B' },
                        { name: 'Sky', value: '#38BDF8' },
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setBrandSecondaryColor(color.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            brandSecondaryColor === color.value
                              ? 'border-gray-900 scale-110'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={brandSecondaryColor}
                      onChange={(e) => setBrandSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      title="Custom color"
                    />
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {brandSecondaryColor}
                    </code>
                  </div>
                </div>
              </div>

              {/* Fonts Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900">Fonts</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Font (Headings) */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Headings
                    </label>
                    <select
                      value={brandPrimaryFont}
                      onChange={(e) => setBrandPrimaryFont(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="default">Default (System Font)</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Cormorant Garamond">Cormorant Garamond</option>
                      <option value="Libre Baskerville">Libre Baskerville</option>
                      <option value="Lora">Lora</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Source Serif Pro">Source Serif Pro</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Inter">Inter</option>
                    </select>
                  </div>

                  {/* Secondary Font (Body) */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Body Text
                    </label>
                    <select
                      value={brandSecondaryFont}
                      onChange={(e) => setBrandSecondaryFont(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="default">Default (System Font)</option>
                      <option value="Lato">Lato</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Inter">Inter</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Work Sans">Work Sans</option>
                      <option value="DM Sans">DM Sans</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Load fonts for preview */}
              <GoogleFontsLoader fonts={[brandPrimaryFont, brandSecondaryFont]} />

              {/* Combined Preview */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-3">Preview</p>
                <div
                  className="rounded-lg overflow-hidden border"
                  style={{ borderColor: `${brandSecondaryColor}40` }}
                >
                  <div
                    className="px-4 py-2 text-white text-sm font-medium"
                    style={{ backgroundColor: brandPrimaryColor }}
                  >
                    Header Bar
                  </div>
                  <div className="bg-gray-50 p-4 space-y-2">
                    <p
                      className="text-lg font-semibold"
                      style={{
                        color: brandPrimaryColor,
                        fontFamily: brandPrimaryFont === 'default' ? 'inherit' : `"${brandPrimaryFont}", serif`,
                      }}
                    >
                      Hotspot Title
                    </p>
                    <p
                      className="text-sm text-gray-600"
                      style={{ fontFamily: brandSecondaryFont === 'default' ? 'inherit' : `"${brandSecondaryFont}", sans-serif` }}
                    >
                      This is how your description text will appear to guests exploring your property.
                    </p>
                    <div
                      className="w-24 h-1.5 rounded-full mt-2"
                      style={{ backgroundColor: brandSecondaryColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== MAP & LOCATION ===== */}
        <SectionHeader>Map & Location</SectionHeader>

        {/* Venue Location */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Venue Location</h3>
            {venueLocationLat && venueLocationLng && (
              <>
                <span className="text-xs text-green-600 font-medium">Location set</span>
                <button
                  type="button"
                  onClick={() => handleVenueLocationChange(null, null)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Set your venue&apos;s location. Search for an address, click on the map, or use your current location.
            When guests are more than {MOCK_DISTANCE_THRESHOLD / 1000}km away, they&apos;ll see a simulated location at your venue so they can explore the map remotely.
          </p>

          <VenueLocationPicker
            latitude={venueLocationLat}
            longitude={venueLocationLng}
            onLocationChange={handleVenueLocationChange}
          />
        </div>

        {/* Guest Interaction */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Guest Interaction</h3>
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
                <p className="font-medium">Tap to Explore</p>
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
                <p className="font-medium">Proximity Auto-Open</p>
                <p className="text-sm text-gray-500">
                  Hotspots automatically open when guests are within 10 meters. Perfect for guided tours.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Custom Map Overlay - Collapsible Beta Section */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <button
            type="button"
            onClick={() => setCustomMapExpanded(!customMapExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform ${customMapExpanded ? 'rotate-90' : ''}`}
              >
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <h3 className="font-semibold">Custom Map Overlay</h3>
              <span className="text-xs bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                Beta
              </span>
            </div>
            <div className="flex items-center gap-3">
              {customMapImageUrl && customMapBounds.northLat && (
                <span className="text-xs text-green-600 font-medium">Configured</span>
              )}
            </div>
          </button>

          {customMapExpanded && (
            <div className="px-6 pb-6 space-y-4 border-t">
              <div className="pt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Upload a custom map (scanned or hand-drawn) and calibrate it with GPS coordinates to overlay on the main map.
                </p>
                {customMapImageUrl && customMapBounds.northLat && (
                  <label className="flex items-center gap-2 cursor-pointer ml-4 shrink-0">
                    <input
                      type="checkbox"
                      checked={customMapEnabled}
                      onChange={(e) => setCustomMapEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Enable overlay</span>
                  </label>
                )}
              </div>

          {!customMapImageUrl ? (
            // Upload dropzone
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Click to upload custom map</span>
                  <span className="text-xs text-gray-400">JPEG, PNG, or WebP (max 5MB)</span>
                </div>
              )}
            </div>
          ) : (
            // Image uploaded - show preview and calibration options
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element -- User-uploaded custom map image */}
                <img
                  src={customMapImageUrl}
                  alt="Custom map preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveCustomMap}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Calibration status */}
              {customMapBounds.northLat ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Calibrated</p>
                    <p className="text-xs text-green-600">
                      {customMapGCPs.length} reference points
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCalibrator(true)}
                    className="text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    Adjust
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Calibration needed</p>
                    <p className="text-xs text-amber-600">
                      Add reference points to position your map
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCalibrator(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    Calibrate
                  </button>
                </div>
              )}

            </div>
          )}
            </div>
          )}
        </div>

        {/* ===== SHARING & DISTRIBUTION ===== */}
        <SectionHeader>Sharing & Distribution</SectionHeader>

        {/* Share Link */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Share Link</h3>
          <p className="text-sm text-gray-500 mb-3">
            Share this link with guests so they can explore your property on their phone.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono text-gray-700 truncate">
              {typeof window !== 'undefined' ? window.location.origin : ''}/explore/{project?.slug}
            </code>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/explore/${project?.slug}`
                navigator.clipboard.writeText(url)
                alert('Link copied to clipboard!')
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy
            </button>
          </div>
        </div>

        {/* Embed & Integration */}
        <EmbedCodeSection
          slug={project?.slug}
          showHeader={embedShowHeader}
          showBranding={embedShowBranding}
          onShowHeaderChange={setEmbedShowHeader}
          onShowBrandingChange={setEmbedShowBranding}
        />

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

      {/* Calibration Modal */}
      {showCalibrator && customMapImageUrl && (
        <CustomMapCalibrator
          imageUrl={customMapImageUrl}
          existingGCPs={customMapGCPs}
          existingBounds={customMapBounds}
          existingOpacity={customMapOpacity}
          venueCenter={
            venueLocationLat && venueLocationLng
              ? { lat: venueLocationLat, lng: venueLocationLng }
              : undefined
          }
          onSave={handleCalibrationSave}
          onCancel={() => setShowCalibrator(false)}
        />
      )}

      {/* Demo Mode Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>This is a Demo</DialogTitle>
            <DialogDescription>
              You cannot save changes in demo mode. Sign up to create your own WanderNest and start building interactive experiences for your guests.
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
    </div>
  )
}
