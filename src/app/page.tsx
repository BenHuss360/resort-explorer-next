'use client'

import { useState, useEffect, useRef, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  MapPin, ArrowRight, Footprints, TreePine, Sparkles, Building2,
  Mountain, Compass, Leaf, ChevronDown, Play, Smartphone,
  MapPinned, Eye, Navigation, Zap
} from 'lucide-react'
import { useProject } from '@/components/providers/project-provider'
import { activateDemoMode, DEMO_PROJECT } from '@/lib/mock-data'

// Parallax scroll hook
function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return offset
}

// Grain texture overlay
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

// Animated gradient background for hero
function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient - Forest Green */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2F4F4F] via-[#3a5f5f] to-[#4a6f6f]" />

      {/* Animated color blobs - Forest Green variants */}
      <div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(47, 79, 79, 0.8) 0%, transparent 50%)',
          animation: 'moveBlob1 15s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(58, 95, 95, 0.8) 0%, transparent 50%)',
          animation: 'moveBlob2 18s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/4 right-1/4 w-1/2 h-1/2 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255, 210, 127, 0.6) 0%, transparent 50%)',
          animation: 'moveBlob3 20s ease-in-out infinite',
        }}
      />

      <style jsx>{`
        @keyframes moveBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30%, 20%) scale(1.1); }
          66% { transform: translate(-20%, 30%) scale(0.9); }
        }
        @keyframes moveBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30%, -20%) scale(0.9); }
          66% { transform: translate(20%, -30%) scale(1.1); }
        }
        @keyframes moveBlob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30%, 30%) scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// Animated logo with sway effect
function AnimatedLogo({ className = '', iconClassName = '' }: { className?: string; iconClassName?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow effect behind logo - Gold */}
      <div className="absolute inset-0 bg-[#FFD27F]/30 rounded-3xl blur-xl animate-pulse" />
      <div className="relative bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 w-full h-full">
        <Footprints
          className={`text-white transition-transform ${iconClassName}`}
          style={{
            animation: 'sway 4s ease-in-out infinite',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg) translateX(0); }
          25% { transform: rotate(1deg) translateX(1px); }
          50% { transform: rotate(2deg) translateX(0); }
          75% { transform: rotate(-1deg) translateX(-1px); }
        }
      `}</style>
    </div>
  )
}

// Shimmer text effect
function ShimmerText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="bg-gradient-to-r from-[#FFD27F] via-[#F5F0E6] to-[#FFD27F] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
        {children}
      </span>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </span>
  )
}

// Tilt card wrapper
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
  }

  const handleMouseLeave = () => {
    setTransform('')
  }

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// Ripple effect hook for buttons
function useRipple() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)
  }, [])

  return { ripples, addRipple }
}

// Scroll animation hook
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// Animated section wrapper
function AnimatedSection({
  children,
  className = '',
  delay = 0
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      {children}
    </div>
  )
}

// Floating decorative elements for hero with parallax
function FloatingElements() {
  const offset = useParallax(0.3)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs with parallax - Forest Green/Gold variants */}
      <div
        className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-white/10 to-[#FFD27F]/15 rounded-full blur-3xl animate-pulse"
        style={{ transform: `translateY(${offset * 0.5}px)` }}
      />
      <div
        className="absolute top-40 right-[15%] w-56 h-56 bg-gradient-to-br from-[#F5F0E6]/10 to-[#FFD27F]/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"
        style={{ transform: `translateY(${offset * 0.3}px)` }}
      />
      <div
        className="absolute bottom-32 left-[20%] w-40 h-40 bg-gradient-to-br from-[#FFD27F]/10 to-[#F5F0E6]/10 rounded-full blur-2xl animate-pulse [animation-delay:2s]"
        style={{ transform: `translateY(${offset * 0.7}px)` }}
      />
      <div
        className="absolute bottom-20 right-[25%] w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse [animation-delay:3s]"
        style={{ transform: `translateY(${offset * 0.4}px)` }}
      />

      {/* Floating icons with parallax */}
      <div
        className="absolute top-32 left-[8%] opacity-20 animate-bounce [animation-duration:3s]"
        style={{ transform: `translateY(${offset * 0.2}px)` }}
      >
        <Mountain className="w-8 h-8 text-[#F5F0E6]" />
      </div>
      <div
        className="absolute top-24 right-[12%] opacity-15 animate-bounce [animation-duration:4s] [animation-delay:0.5s]"
        style={{ transform: `translateY(${offset * 0.4}px)` }}
      >
        <Compass className="w-10 h-10 text-[#F5F0E6]" />
      </div>
      <div
        className="absolute bottom-44 right-[8%] opacity-20 animate-bounce [animation-duration:3.5s] [animation-delay:1s]"
        style={{ transform: `translateY(${offset * 0.3}px)` }}
      >
        <Leaf className="w-6 h-6 text-[#F5F0E6]" />
      </div>
      <div
        className="absolute bottom-52 left-[15%] opacity-15 animate-bounce [animation-duration:4.5s] [animation-delay:1.5s]"
        style={{ transform: `translateY(${offset * 0.5}px)` }}
      >
        <TreePine className="w-7 h-7 text-[#F5F0E6]" />
      </div>
    </div>
  )
}

// Improved scroll indicator
function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="text-[#F5F0E6]/70 text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
      <div className="w-6 h-10 rounded-full border-2 border-[#F5F0E6]/30 flex items-start justify-center p-1">
        <div className="w-1.5 h-3 bg-[#FFD27F]/70 rounded-full animate-scrollBounce" />
      </div>
      <style jsx>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(12px); opacity: 0.3; }
        }
        .animate-scrollBounce {
          animation: scrollBounce 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Floating Demo CTA
function FloatingDemoCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const { setProject } = useProject()

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDemo = () => {
    activateDemoMode()
    setProject(DEMO_PROJECT)
    toast.success('Welcome to Demo Mode!')
    router.push('/portal/preview')
  }

  return (
    <button
      onClick={handleDemo}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2F4F4F] to-[#3a5f5f] text-[#F5F0E6] font-semibold rounded-full shadow-lg shadow-[#FFD27F]/30 hover:shadow-[#FFD27F]/50 hover:scale-105 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <Play className="w-4 h-4 fill-current" />
      <span className="hidden sm:inline">Try Demo</span>
    </button>
  )
}

// Quick Demo Button for Hero with ripple effect
function QuickDemoButton() {
  const router = useRouter()
  const { setProject } = useProject()
  const { ripples, addRipple } = useRipple()

  const handleDemo = (e: React.MouseEvent<HTMLButtonElement>) => {
    addRipple(e)
    activateDemoMode()
    setProject(DEMO_PROJECT)
    toast.success('Welcome to Demo Mode!')
    router.push('/portal/preview')
  }

  return (
    <button
      onClick={handleDemo}
      className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-[#F5F0E6]/20 text-[#F5F0E6] font-medium rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-[#FFD27F]/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      <Play className="w-4 h-4 fill-current" />
      Try Demo Instantly
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  )
}

// Unified Login Card with tabs for Guest Access and Property Portal
function UnifiedLoginCard() {
  const [accessCode, setAccessCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setProject } = useProject()

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) return

    setIsLoading(true)

    // Check for demo mode first
    if (accessCode.trim().toUpperCase() === 'DEMO') {
      activateDemoMode()
      setProject(DEMO_PROJECT)
      toast.success('Welcome to Demo Mode!')
      router.push('/portal/preview')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/projects/by-code/${accessCode.trim().toUpperCase()}`)

      if (res.ok) {
        const data = await res.json()
        setProject(data)
        toast.success(`Welcome to ${data.resortName}!`)
        router.push(`/embed/${accessCode.trim().toUpperCase()}`)
      } else {
        toast.error('Invalid access code. Please check and try again.')
      }
    } catch {
      toast.error('Invalid access code. Please check and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    // Test account check
    if (email.trim().toLowerCase() === 'ben@appletrees.com' && password === '123') {
      // Clear demo mode and fetch real project
      localStorage.removeItem('demoMode')
      try {
        const res = await fetch('/api/projects/by-code/APPLETREES')
        if (res.ok) {
          const data = await res.json()
          setProject({
            id: data.id,
            resortName: data.resortName,
            accessCode: data.accessCode,
            homepageContent: data.homepageContent || '',
            mapExperience: data.mapExperience || 'full',
            boundaries: {
              north: data.northBoundary,
              south: data.southBoundary,
              east: data.eastBoundary,
              west: data.westBoundary,
            },
            customMapOverlay: {
              imageUrl: data.customMapImageUrl,
              northLat: data.customMapNorthLat,
              southLat: data.customMapSouthLat,
              westLng: data.customMapWestLng,
              eastLng: data.customMapEastLng,
              opacity: data.customMapOpacity ?? 1.0,
              enabled: data.customMapEnabled || false,
              gcps: data.customMapGCPs || [],
              calibrationMode: data.customMapCalibrationMode || '2corners',
            },
            venueLocation: {
              latitude: data.venueLocationLat,
              longitude: data.venueLocationLng,
            },
            embedSettings: {
              showHeader: data.embedShowHeader ?? true,
              showBranding: data.embedShowBranding ?? true,
            },
          })
          toast.success(`Welcome! Managing ${data.resortName}`)
          router.push('/portal')
        } else {
          setIsLoading(false)
          toast.error('No project found. Please create one first.')
        }
      } catch {
        setIsLoading(false)
        toast.error('Failed to load project.')
      }
    } else {
      setIsLoading(false)
      toast.error('Invalid email or password.')
    }
  }

  const handleForgotPassword = () => {
    toast.info('Password recovery coming soon.')
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-2xl">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2F4F4F] via-[#FFD27F] to-[#2F4F4F]" />

      <CardHeader className="text-center pb-4 pt-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#2F4F4F] via-[#3a5f5f] to-[#4a6f6f] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#2F4F4F]/30">
          <Footprints className="w-8 h-8 text-[#F5F0E6]" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#2F4F4F] via-[#3a5f5f] to-[#2F4F4F] bg-clip-text text-transparent">
          Welcome to Wandernest
        </CardTitle>
        <CardDescription className="text-[#708090] mt-1">
          Enter your access code or sign in to manage your property
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-8 px-6">
        <Tabs defaultValue="guest" className="w-full">
          <TabsList className="w-full mb-6 bg-[#F5F0E6] p-1 rounded-lg">
            <TabsTrigger value="guest" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <Footprints className="w-4 h-4 mr-2" />
              Guest Access
            </TabsTrigger>
            <TabsTrigger value="property" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <Building2 className="w-4 h-4 mr-2" />
              Property Portal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guest">
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <Label htmlFor="access-code" className="text-sm font-medium text-[#708090]">
                  Access Code
                </Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Enter your code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="mt-2 text-center text-lg font-bold tracking-[0.2em] uppercase h-12 border-[#2F4F4F]/20 focus:border-[#FFD27F] focus:ring-[#FFD27F]/20"
                  maxLength={10}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#2F4F4F] to-[#3a5f5f] hover:from-[#3a5f5f] hover:to-[#4a6f6f] text-[#F5F0E6] font-semibold shadow-lg shadow-[#FFD27F]/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    Begin Exploring
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-[#708090]">
                Ask your property's front desk for an access code
              </p>
            </form>
          </TabsContent>

          <TabsContent value="property">
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-[#708090]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@property.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-10 border-[#2F4F4F]/20 focus:border-[#FFD27F] focus:ring-[#FFD27F]/20"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-[#708090]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 h-10 border-[#2F4F4F]/20 focus:border-[#FFD27F] focus:ring-[#FFD27F]/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#2F4F4F] to-[#3a5f5f] hover:from-[#3a5f5f] hover:to-[#4a6f6f] text-[#F5F0E6] font-semibold shadow-lg shadow-[#FFD27F]/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-center text-sm text-[#708090]/70 hover:text-[#708090] transition-colors"
              >
                Forgot your password?
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2F4F4F]/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-[#708090]">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  activateDemoMode()
                  setProject(DEMO_PROJECT)
                  toast.success('Welcome to Demo Mode!')
                  router.push('/portal/preview')
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#2F4F4F] hover:text-[#3a5f5f] hover:bg-[#F5F0E6] rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Explore the demo
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Phone mockup with animated elements
function PhoneMockup() {
  return (
    <div className="relative mx-auto max-w-[320px] lg:max-w-none">
      {/* Phone frame */}
      <div className="relative bg-[#2F4F4F] rounded-[3rem] p-3 shadow-2xl shadow-[#2F4F4F]/30">
        {/* Screen */}
        <div className="bg-gradient-to-b from-[#F5F0E6] to-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
          {/* Status bar */}
          <div className="bg-[#2F4F4F] px-6 py-3 flex items-center justify-between">
            <span className="text-[#F5F0E6]/90 text-xs font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-[#F5F0E6]/90 rounded-sm" />
            </div>
          </div>

          {/* App header */}
          <div className="bg-gradient-to-b from-[#2F4F4F] to-[#3a5f5f] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <TreePine className="w-5 h-5 text-[#F5F0E6]" />
              </div>
              <div>
                <p className="text-[#F5F0E6] font-semibold">Mountain Retreat</p>
                <p className="text-[#F5F0E6]/70 text-xs">12 spots to discover</p>
              </div>
            </div>
          </div>

          {/* Map area */}
          <div className="relative h-48 bg-gradient-to-b from-[#F5F0E6]/50 to-white/50">
            {/* Simulated map elements */}
            <div className="absolute inset-4">
              {/* Paths */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <path d="M20,80 Q40,60 50,50 T80,30" stroke="#2F4F4F" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.4" />
                <path d="M10,40 Q30,50 60,45 T90,60" stroke="#708090" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.4" />
              </svg>

              {/* Animated map pins */}
              <div className="absolute top-[20%] left-[30%] w-8 h-8 bg-gradient-to-b from-[#FFD27F] to-[#f5c55a] rounded-full flex items-center justify-center shadow-lg animate-pinPulse">
                <MapPin className="w-4 h-4 text-[#2F4F4F]" />
              </div>
              <div className="absolute top-[50%] left-[60%] w-6 h-6 bg-gradient-to-b from-[#2F4F4F] to-[#3a5f5f] rounded-full flex items-center justify-center shadow-md animate-pinPulse [animation-delay:0.5s]">
                <MapPin className="w-3 h-3 text-[#F5F0E6]" />
              </div>
              <div className="absolute top-[70%] left-[25%] w-6 h-6 bg-gradient-to-b from-[#708090] to-[#5a6a7a] rounded-full flex items-center justify-center shadow-md animate-pinPulse [animation-delay:1s]">
                <MapPin className="w-3 h-3 text-[#F5F0E6]" />
              </div>
              <div className="absolute top-[35%] right-[15%] w-5 h-5 bg-[#708090]/40 rounded-full flex items-center justify-center opacity-60">
                <MapPin className="w-2.5 h-2.5 text-[#708090]" />
              </div>

              {/* Animated user location - Forest Green */}
              <div className="absolute animate-userMove">
                <div className="w-4 h-4 bg-[#2F4F4F] rounded-full border-2 border-[#F5F0E6] shadow-lg" />
                <div className="absolute inset-0 w-4 h-4 bg-[#2F4F4F] rounded-full animate-ping opacity-20" />
              </div>
            </div>

            <style jsx>{`
              @keyframes pinPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
              @keyframes userMove {
                0%, 100% { top: 45%; left: 40%; }
                25% { top: 42%; left: 45%; }
                50% { top: 48%; left: 42%; }
                75% { top: 44%; left: 38%; }
              }
              .animate-pinPulse {
                animation: pinPulse 2s ease-in-out infinite;
              }
              .animate-userMove {
                animation: userMove 8s ease-in-out infinite;
              }
            `}</style>
          </div>

          {/* Nearby card */}
          <div className="px-4 py-3">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#2F4F4F]/10">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2F4F4F] to-[#3a5f5f] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-[#FFD27F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#2F4F4F] text-sm">Meditation Garden</p>
                  <p className="text-xs text-[#FFD27F] font-medium">50m away · Unlocked!</p>
                  <p className="text-xs text-[#708090] mt-1 line-clamp-2">A tranquil space for morning meditation...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom nav hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#2F4F4F]/20 rounded-full" />
        </div>

        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#2F4F4F] rounded-full" />
      </div>

      {/* Decorative elements around phone */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-[#FFD27F] to-[#f5c55a] rounded-2xl opacity-20 blur-xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-[#2F4F4F] to-[#3a5f5f] rounded-full opacity-20 blur-xl" />
    </div>
  )
}

// Product Preview Section
function ProductPreviewSection() {
  const features = [
    { icon: MapPinned, label: 'Interactive Map', description: 'See all points of interest' },
    { icon: Navigation, label: 'GPS Navigation', description: 'Get directions to any spot' },
    { icon: Eye, label: 'Proximity Unlock', description: 'Content reveals as you approach' },
    { icon: Zap, label: 'Instant Access', description: 'No app download required' },
  ]

  return (
    <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-[#F5F0E6]/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#FFD27F]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#2F4F4F]/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#FFD27F]/30 to-[#F5F0E6] text-[#2F4F4F] text-sm font-medium rounded-full mb-4">
            See It In Action
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2F4F4F] mb-4">
            Exploration Made{' '}
            <span className="bg-gradient-to-r from-[#2F4F4F] to-[#3a5f5f] bg-clip-text text-transparent">
              Beautiful
            </span>
          </h2>
          <p className="text-lg text-[#708090] max-w-2xl mx-auto">
            A seamless mobile experience that guides guests through your property with interactive maps and location-aware content
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Phone Mockup */}
          <AnimatedSection delay={200}>
            <PhoneMockup />
          </AnimatedSection>

          {/* Features list */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={300 + index * 100}>
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2F4F4F] to-[#3a5f5f] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFD27F]/20 group-hover:scale-110 transition-transform flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-[#F5F0E6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#2F4F4F] mb-1">{feature.label}</h3>
                    <p className="text-[#708090]">{feature.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      icon: MapPin,
      title: 'Get Your Code',
      description: 'Your property provides a unique access code for your stay',
      color: 'from-[#FFD27F] to-[#f5c55a]',
      shadowColor: 'shadow-[#FFD27F]/25',
    },
    {
      icon: Footprints,
      title: 'Wander Freely',
      description: 'Explore the grounds at your own pace with GPS guidance',
      color: 'from-[#2F4F4F] to-[#3a5f5f]',
      shadowColor: 'shadow-[#2F4F4F]/25',
    },
    {
      icon: Sparkles,
      title: 'Discover More',
      description: 'Hidden content reveals as you approach interesting spots',
      color: 'from-[#708090] to-[#5a6a7a]',
      shadowColor: 'shadow-[#708090]/25',
    },
  ]

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F5F0E6]/30 to-white" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFD27F]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2F4F4F]/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#FFD27F]/30 text-[#2F4F4F] text-sm font-medium rounded-full mb-4">
            Simple & Intuitive
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2F4F4F] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#708090] max-w-2xl mx-auto">
            GPS-powered discovery that unfolds naturally as you wander through the property
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, index) => (
            <AnimatedSection key={index} delay={index * 150}>
              <div className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#2F4F4F]/20 to-transparent" />
                )}

                <div className="text-center p-6">
                  {/* Step number */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border-2 border-[#2F4F4F]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#708090] group-hover:border-[#FFD27F] group-hover:text-[#2F4F4F] transition-colors shadow-sm">
                    {index + 1}
                  </div>

                  <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${step.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <step.icon className="w-12 h-12 text-[#F5F0E6]" />
                  </div>
                  <h3 className="font-bold text-xl text-[#2F4F4F] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#708090] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Grid
function FeaturesSection() {
  const features = [
    { icon: Smartphone, title: 'No App Download', description: 'Works directly in your browser' },
    { icon: Zap, title: 'Works Offline', description: 'Content cached for spotty signal areas' },
    { icon: Eye, title: 'Privacy First', description: 'Location data never leaves your device' },
    { icon: Navigation, title: 'Instant Access', description: 'Just enter your code and start exploring' },
  ]

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-[#2F4F4F] via-[#3a5f5f] to-[#2F4F4F] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,210,127,0.15),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(47,79,79,0.15),transparent_50%)]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                  <feature.icon className="w-6 h-6 text-[#FFD27F]" />
                </div>
                <h4 className="font-semibold text-[#F5F0E6] mb-1">{feature.title}</h4>
                <p className="text-sm text-[#F5F0E6]/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Grain texture overlay */}
      <GrainOverlay />

      {/* Hero Section */}
      <header id="hero-section" className="relative min-h-[90vh] md:min-h-screen flex flex-col pt-16 md:pt-20 pb-32 md:pb-40 px-4 overflow-hidden">
        {/* Animated gradient background */}
        <AnimatedGradientBg />

        <FloatingElements />

        {/* Mesh gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,210,127,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(47,79,79,0.5),transparent_50%)]" />

        <div className="flex-1 flex items-center">
          <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 md:mb-8 border border-[#F5F0E6]/10">
              <span className="w-2 h-2 bg-[#FFD27F] rounded-full animate-pulse" />
              <span className="text-[#F5F0E6] text-sm font-medium">GPS-Powered Exploration</span>
            </div>

            {/* Animated swaying logo */}
            <AnimatedLogo
              className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8"
              iconClassName="w-10 h-10 md:w-12 md:h-12"
            />

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Wander. Discover.
              <br />
              <ShimmerText>Experience.</ShimmerText>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-[#F5F0E6]/90 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-4">
              GPS-powered exploration for wellness retreats and luxury properties.
              Let your guests discover at their own pace.
            </p>
          </div>
        </div>

        <ScrollIndicator />
      </header>

      {/* Login Card */}
      <main className="max-w-md mx-auto px-4 -mt-20 md:-mt-24 relative z-10">
        <AnimatedSection>
          <UnifiedLoginCard />
        </AnimatedSection>
      </main>

      {/* Product Preview */}
      <ProductPreviewSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-[#F5F0E6] border-t border-[#2F4F4F]/10">
        <div className="max-w-5xl mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2F4F4F] to-[#3a5f5f] rounded-xl flex items-center justify-center shadow-lg shadow-[#2F4F4F]/20 group-hover:shadow-[#FFD27F]/40 group-hover:scale-110 transition-all duration-300">
                  <Footprints className="w-6 h-6 text-[#F5F0E6] group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="font-bold text-2xl text-[#2F4F4F] group-hover:text-[#3a5f5f] transition-colors">Wandernest</span>
              </div>
              <p className="text-sm text-[#708090] text-center md:text-right max-w-md">
                GPS-powered exploration for properties that care about guest experience.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </footer>
    </div>
  )
}
