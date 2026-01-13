'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'
import Link from 'next/link'
import type { Hotspot } from '@/lib/db/schema'

export default function PortalHotspotsPage() {
  const { project } = useProject()
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['hotspots', project?.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${project!.id}/hotspots`)
      if (!res.ok) throw new Error('Failed to fetch hotspots')
      return res.json() as Promise<Hotspot[]>
    },
    enabled: !!project?.id,
  })

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

  const handleDelete = (hotspot: Hotspot) => {
    if (confirm(`Delete "${hotspot.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(hotspot.id)
    }
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading hotspots...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Hotspots ({hotspots.length})</h2>
        <Link
          href="/portal/hotspots/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Add Hotspot
        </Link>
      </div>

      {hotspots.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500 mb-4">No hotspots yet. Create your first one!</p>
          <Link
            href="/portal/hotspots/new"
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Hotspot
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {hotspots.map((hotspot) => (
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
