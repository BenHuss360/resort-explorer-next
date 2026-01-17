'use client'

import { useState, useRef } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { AddToken } from '@/lib/db/schema'

interface QRGeneratorDialogProps {
  projectId?: number
  accessCode?: string
  trigger: React.ReactNode
}

export function QRGeneratorDialog({ projectId, accessCode, trigger }: QRGeneratorDialogProps) {
  const queryClient = useQueryClient()
  const qrRef = useRef<HTMLDivElement>(null)
  const [expiryHours, setExpiryHours] = useState(24)
  const [generatedQR, setGeneratedQR] = useState<{ token: string; qrUrl: string; expiresAt: string } | null>(null)
  const [open, setOpen] = useState(false)

  // Fetch existing tokens
  const { data: tokens = [] } = useQuery<AddToken[]>({
    queryKey: ['tokens', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/tokens?projectId=${projectId}`)
      if (!res.ok) throw new Error('Failed to fetch tokens')
      return res.json()
    },
    enabled: !!projectId && open,
  })

  // Generate token mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, expiresInHours: expiryHours }),
      })
      if (!res.ok) throw new Error('Failed to generate token')
      return res.json()
    },
    onSuccess: (data) => {
      setGeneratedQR(data)
      queryClient.invalidateQueries({ queryKey: ['tokens', projectId] })
    },
  })

  // Revoke token mutation
  const revokeMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch(`/api/tokens/${token}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to revoke token')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens', projectId] })
      if (generatedQR && tokens.every(t => t.token !== generatedQR.token)) {
        setGeneratedQR(null)
      }
    },
  })

  // Download QR code as PNG
  const downloadQR = () => {
    if (!qrRef.current) return
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    canvas.width = 300
    canvas.height = 300

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 300, 300)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${accessCode}-add-hotspot-qr.png`
      link.href = pngUrl
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const formatExpiry = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h left`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`
    }
    if (minutes > 0) {
      return `${minutes}m left`
    }
    return 'Expired'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mobile Hotspot Creator</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Generate a QR code to add hotspots on-the-go. Scan with your phone, walk to a location, snap a photo, and submit a new hotspot.
          </p>

          {/* Generate QR Code */}
          <div className="flex items-center gap-3">
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>1 hour</option>
              <option value={4}>4 hours</option>
              <option value={24}>24 hours</option>
              <option value={168}>1 week</option>
            </select>
            <button
              type="button"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  Generate QR
                </>
              )}
            </button>
          </div>

          {/* Show generated QR */}
          {generatedQR && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-start gap-4">
                <div ref={qrRef} className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCodeSVG value={generatedQR.qrUrl} size={150} level="M" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-gray-900">Scan to add hotspots</p>
                  <p className="text-xs text-gray-500">
                    Expires: {new Date(generatedQR.expiresAt).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={downloadQR}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        revokeMutation.mutate(generatedQR.token)
                        setGeneratedQR(null)
                      }}
                      className="px-3 py-1.5 text-red-600 hover:text-red-700 text-sm"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active tokens */}
          {tokens.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Tokens</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <code className="text-gray-600 font-mono text-xs">
                        {token.token.substring(0, 8)}...
                      </code>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {formatExpiry(token.expiresAt.toString())}
                      </span>
                      <button
                        type="button"
                        onClick={() => revokeMutation.mutate(token.token)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Revoke token"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Hotspots created via mobile are saved as drafts and must be published from the portal.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
