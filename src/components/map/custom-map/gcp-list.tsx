'use client'

import type { GroundControlPoint } from '@/lib/db/schema'

interface GCPListProps {
  gcps: GroundControlPoint[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function GCPList({ gcps, onRemove, onClearAll }: GCPListProps) {
  if (gcps.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Reference Points ({gcps.length})
        </h4>
        <button
          onClick={onClearAll}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {gcps.map((gcp, index) => (
          <div
            key={gcp.id}
            className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm"
          >
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
              {index + 1}
            </span>
            <span className="text-gray-700">
              {gcp.label || `Point ${index + 1}`}
            </span>
            <span className="text-gray-400 text-xs">
              ({gcp.imageX.toFixed(2)}, {gcp.imageY.toFixed(2)})
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-400 text-xs">
              ({gcp.latitude.toFixed(4)}, {gcp.longitude.toFixed(4)})
            </span>
            <button
              onClick={() => onRemove(gcp.id)}
              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label={`Remove ${gcp.label || `Point ${index + 1}`}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
