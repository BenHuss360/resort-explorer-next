'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HotspotForm } from '@/components/forms/hotspot-form'
import Link from 'next/link'
import type { Hotspot } from '@/lib/db/schema'

export default function EditHotspotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data: hotspot, isLoading, error } = useQuery({
    queryKey: ['hotspot', id],
    queryFn: async () => {
      const res = await fetch(`/api/hotspots/${id}`)
      if (!res.ok) throw new Error('Hotspot not found')
      return res.json() as Promise<Hotspot>
    },
  })

  if (isLoading) {
    return <div className="text-gray-500">Loading hotspot...</div>
  }

  if (error || !hotspot) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Hotspot not found</p>
        <Link href="/portal" className="text-blue-600 hover:text-blue-700">
          ← Back to Hotspots
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/portal"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </Link>
        <h2 className="text-lg font-semibold">Edit: {hotspot.title}</h2>
      </div>

      <HotspotForm hotspot={hotspot} mode="edit" />
    </div>
  )
}
