'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'
import { isDemoMode, DEMO_HOTSPOTS } from '@/lib/mock-data'
import { QRGeneratorDialog } from '@/components/modals/qr-generator-dialog'
import Link from 'next/link'
import type { Hotspot } from '@/lib/db/schema'

export default function PortalHotspotsPage() {
  const { project } = useProject()
  const queryClient = useQueryClient()
  const [_deletingId, setDeletingId] = useState<number | null>(null)

  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['hotspots', project?.id],
    queryFn: async () => {
      // Return demo hotspots if in demo mode
      if (isDemoMode()) {
        return DEMO_HOTSPOTS
      }
      // Include drafts for portal view
      const res = await fetch(`/api/projects/${project!.id}/hotspots?includeDrafts=true`)
      if (!res.ok) throw new Error('Failed to fetch hotspots')
      return res.json() as Promise<Hotspot[]>
    },
    enabled: !!project?.id,
  })

  // Separate drafts from published hotspots
  const drafts = hotspots.filter(h => h.isDraft)
  const published = hotspots.filter(h => !h.isDraft)

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/hotspots/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete hotspot')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots', project?.id] })
      setDeletingId(null)
    },
  })

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/hotspots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDraft: false }),
      })
      if (!res.ok) throw new Error('Failed to publish hotspot')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots', project?.id] })
    },
  })

  const handleDelete = (hotspot: Hotspot) => {
    if (isDemoMode()) {
      alert('Deletion is disabled in demo mode. Sign up to manage your own hotspots!')
      return
    }
    if (confirm(`Delete "${hotspot.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(hotspot.id)
    }
  }

  const handlePublish = (hotspot: Hotspot) => {
    if (isDemoMode()) {
      alert('Publishing is disabled in demo mode. Sign up to manage your own hotspots!')
      return
    }
    publishMutation.mutate(hotspot.id)
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading hotspots...</div>
  }

  return (
    <div className="space-y-6">
      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Pending Review</h2>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 divide-y divide-amber-200">
            {drafts.map((hotspot) => (
              <div key={hotspot.id} className="p-4 flex items-center gap-4">
                {/* Thumbnail or Marker */}
                {hotspot.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- User-uploaded image from external URL
                  <img
                    src={hotspot.imageUrl}
                    alt={hotspot.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: hotspot.markerColor || '#FFD27F' }}
                  >
                    <span className="text-white text-sm font-bold">
                      {hotspot.markerType?.charAt(0).toUpperCase() || 'P'}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{hotspot.title}</h3>
                    {hotspot.createdVia === 'mobile' && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                        Mobile
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/portal/hotspots/${hotspot.id}/edit`}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-amber-100 rounded transition-colors"
                  >
                    Review
                  </Link>
                  <button
                    onClick={() => handlePublish(hotspot)}
                    disabled={publishMutation.isPending}
                    className="px-3 py-1.5 text-sm bg-emerald-500 text-white hover:bg-emerald-600 rounded transition-colors disabled:opacity-50"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleDelete(hotspot)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Hotspots */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Hotspots ({published.length})</h2>
        <div className="flex items-center gap-2">
          <QRGeneratorDialog
            projectId={project?.id}
            slug={project?.slug}
            trigger={
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add hotspot via mobile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                  <path d="M21 21v.01" />
                  <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                  <path d="M3 12h.01" />
                  <path d="M12 3h.01" />
                  <path d="M12 16v.01" />
                  <path d="M16 12h1" />
                  <path d="M21 12v.01" />
                  <path d="M12 21v-1" />
                </svg>
              </button>
            }
          />
          <Link
            href="/portal/hotspots/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Add Hotspot
          </Link>
        </div>
      </div>

      {published.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500 mb-4">No published hotspots yet. Create your first one!</p>
          <Link
            href="/portal/hotspots/new"
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Hotspot
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {published.map((hotspot) => (
            <div key={hotspot.id} className="p-4 flex items-center gap-4">
              {/* Marker Preview */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: hotspot.markerColor || '#3B82F6' }}
              >
                <span className="text-white text-xs font-bold">
                  {hotspot.markerType?.charAt(0).toUpperCase() || 'P'}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{hotspot.title}</h3>
                <p className="text-sm text-gray-500 truncate">{hotspot.description}</p>
              </div>

              {/* Coordinates */}
              <div className="hidden sm:block text-sm text-gray-400">
                {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/portal/hotspots/${hotspot.id}/edit`}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(hotspot)}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
