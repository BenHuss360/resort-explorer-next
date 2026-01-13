'use client'

import { HotspotForm } from '@/components/forms/hotspot-form'
import Link from 'next/link'

export default function NewHotspotPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/portal"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </Link>
        <h2 className="text-lg font-semibold">New Hotspot</h2>
      </div>

      <HotspotForm mode="create" />
    </div>
  )
}
