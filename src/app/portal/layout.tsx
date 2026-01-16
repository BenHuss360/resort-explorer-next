'use client'

import { useState, useEffect } from 'react'
import { useProject } from '@/components/providers/project-provider'
import { Badge } from '@/components/ui/badge'
import { isDemoMode } from '@/lib/mock-data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { name: 'Hotspots', href: '/portal' },
  { name: 'Preview', href: '/portal/preview' },
  { name: 'Settings', href: '/portal/settings' },
]

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { project } = useProject()
  const pathname = usePathname()
  const [isDemo, setIsDemo] = useState(false)

  // Check demo mode after mount to avoid hydration mismatch
  useEffect(() => {
    setIsDemo(isDemoMode())
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">{project?.resortName || 'Resort'} Portal</h1>
                {isDemo && (
                  <Badge variant="warning">Demo Mode</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Access Code: <code className="bg-gray-100 px-2 py-0.5 rounded">{project?.accessCode}</code>
              </p>
            </div>
            {!isDemo && (
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Home
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-6">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href ||
                (tab.href === '/portal' && pathname.startsWith('/portal/hotspots'))
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
