'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { activateDemoMode } from '@/lib/mock-data'

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const router = useRouter()
  const [propertyCode, setPropertyCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Use the property code (slug) to look up the project
      const res = await fetch(`/api/projects/by-slug/${encodeURIComponent(propertyCode.toLowerCase())}`)

      if (!res.ok) {
        if (res.status === 404) {
          setError('Invalid property code or password.')
        } else {
          setError('Something went wrong. Please try again.')
        }
        setIsLoading(false)
        return
      }

      const project = await res.json()
      localStorage.setItem('currentProject', JSON.stringify(project))
      onOpenChange(false)
      router.push('/portal')
    } catch {
      setError('Connection error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    activateDemoMode()
    onOpenChange(false)
    router.push('/portal')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#2F4F4F]">Sign in to your property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="propertyCode" className="block text-sm font-medium text-[#708090] mb-1.5">
              Property Code
            </label>
            <input
              id="propertyCode"
              type="text"
              value={propertyCode}
              onChange={(e) => setPropertyCode(e.target.value)}
              placeholder="e.g., the-newt-somerset"
              className="w-full px-4 py-3 rounded-lg border border-[#708090]/20 bg-white text-[#2F4F4F] placeholder:text-[#708090]/50 focus:outline-none focus:ring-2 focus:ring-[#FFD27F] focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#708090] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-[#708090]/20 bg-white text-[#2F4F4F] placeholder:text-[#708090]/50 focus:outline-none focus:ring-2 focus:ring-[#FFD27F] focus:border-transparent transition-all"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!propertyCode.trim() || !password.trim() || isLoading}
            className="w-full py-3 px-4 bg-[#2F4F4F] text-[#F5F0E6] rounded-lg font-medium hover:bg-[#3D6363] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-[#708090]">
            Try{' '}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-[#2F4F4F] font-medium hover:underline"
            >
              demo mode
            </button>{' '}
            to explore
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
