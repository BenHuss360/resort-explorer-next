'use client'

import { useState, useEffect, useRef, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  MapPin, ArrowRight, Footprints, TreePine, Sparkles, Building2,
  Mountain, Compass, Leaf, ChevronDown, Play, Smartphone,
  MapPinned, Eye, Navigation, Zap
} from 'lucide-react'
import { useProject } from '@/components/providers/project-provider'
import { activateDemoMode, DEMO_PROJECT } from '@/lib/mock-data'

// Mouse position hook for cursor effects
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return position
}

// Cursor glow effect for hero
function CursorGlow() {
  const { x, y } = useMousePosition()
  const [isInHero, setIsInHero] = useState(false)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const heroEl = document.getElementById('hero-section')
    if (!heroEl) return

    const handleEnter = () => setIsInHero(true)
    const handleLeave = () => setIsInHero(false)

    heroEl.addEventListener('mouseenter', handleEnter)
    heroEl.addEventListener('mouseleave', handleLeave)

    return () => {
      heroEl.removeEventListener('mouseenter', handleEnter)
      heroEl.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  if (!isInHero) return null

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-50 w-64 h-64 rounded-full opacity-30 blur-3xl transition-opacity duration-300"
      style={{
        left: x - 128,
        top: y - 128,
        background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, rgba(20, 184, 166, 0.2) 50%, transparent 70%)',
      }}
    />
  )
}

// Animated logo with sway effect
function AnimatedLogo({ className = '', iconClassName = '' }: { className?: string; iconClassName?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow effect behind logo */}
      <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl blur-xl animate-pulse" />
      <div className="relative bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 w-full h-full">
        <TreePine
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

// Floating decorative elements for hero
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-white/10 to-teal-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-[15%] w-56 h-56 bg-gradient-to-br from-emerald-300/15 to-cyan-400/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute bottom-32 left-[20%] w-40 h-40 bg-gradient-to-br from-teal-200/15 to-emerald-300/10 rounded-full blur-2xl animate-pulse [animation-delay:2s]" />
      <div className="absolute bottom-20 right-[25%] w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse [animation-delay:3s]" />

      {/* Floating icons */}
      <div className="absolute top-32 left-[8%] opacity-20 animate-bounce [animation-duration:3s]">
        <Mountain className="w-8 h-8 text-white" />
      </div>
      <div className="absolute top-24 right-[12%] opacity-15 animate-bounce [animation-duration:4s] [animation-delay:0.5s]">
        <Compass className="w-10 h-10 text-white" />
      </div>
      <div className="absolute bottom-44 right-[8%] opacity-20 animate-bounce [animation-duration:3.5s] [animation-delay:1s]">
        <Leaf className="w-6 h-6 text-white" />
      </div>
      <div className="absolute bottom-52 left-[15%] opacity-15 animate-bounce [animation-duration:4.5s] [animation-delay:1.5s]">
        <TreePine className="w-7 h-7 text-white" />
      </div>
    </div>
  )
}

// Scroll indicator
function ScrollIndicator() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
      <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
      <ChevronDown className="w-5 h-5 text-white/60" />
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
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDemo = () => {
    activateDemoMode()
    setProject(DEMO_PROJECT)
    toast.success('Welcome to Demo Mode!')
    router.push('/map')
  }

  return (
    <button
      onClick={handleDemo}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 ${
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
    router.push('/map')
  }

  return (
    <button
      onClick={handleDemo}
      className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-medium rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
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

// Guest Access Card Component (Primary - More Prominent)
function GuestAccessCard() {
  const [accessCode, setAccessCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setProject } = useProject()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) return

    setIsLoading(true)

    try {
      const res = await fetch(`/api/auth?code=${accessCode.trim().toUpperCase()}`)

      if (res.ok) {
        const data = await res.json()
        setProject(data.project)
        toast.success(`Welcome to ${data.project.resortName}!`)
        router.push('/map')
      } else {
        toast.error('Invalid access code. Please check and try again.')
      }
    } catch {
      if (accessCode.trim().toUpperCase() === 'DEMO') {
        activateDemoMode()
        setProject(DEMO_PROJECT)
        toast.success('Welcome to Demo Mode!')
        router.push('/map')
      } else {
        toast.error('Invalid access code. Please check and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
      {/* Prominent gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[2px] bg-white rounded-[inherit]" />

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      {/* Decorative corner element */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

      <div className="relative">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="w-18 h-18 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Footprints className="w-9 h-9 text-white" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Start Wandering
          </CardTitle>
          <CardDescription className="text-base mt-2 text-stone-600">
            Got a code from your property? Enter it to begin exploring.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="access-code" className="text-sm font-medium text-stone-600">
                Access Code
              </Label>
              <Input
                id="access-code"
                type="text"
                placeholder="Enter your code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="mt-2 text-center text-xl font-bold tracking-[0.25em] uppercase h-14 border-2 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all rounded-xl"
                maxLength={10}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding your path...
                </span>
              ) : (
                <>
                  Begin Exploring
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-stone-500">
            Ask your property's front desk for an access code
          </p>
        </CardContent>
      </div>
    </Card>
  )
}

// Creator Login Card Component (Secondary - Less Prominent)
function CreatorLoginCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setProject } = useProject()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    activateDemoMode()
    setProject(DEMO_PROJECT)

    toast.success('Welcome to Demo Mode! Explore with sample data.')
    router.push('/portal')
  }

  const handleForgotPassword = () => {
    toast.info('Password recovery coming soon.')
  }

  return (
    <Card className="group relative overflow-hidden border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

      {/* Decorative corner element */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors duration-500" />

      <CardHeader className="text-center pb-2 pt-6">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-stone-700">
          Property Portal
        </CardTitle>
        <CardDescription className="text-sm mt-1">
          Manage your discovery experience
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 px-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="email" className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@property.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-10 text-sm border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 transition-colors"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-10 text-sm border-stone-200 focus:border-amber-500 focus:ring-amber-500/20 transition-colors"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300"
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
        </form>

        <button
          onClick={handleForgotPassword}
          className="mt-3 w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Forgot your password?
        </button>
      </CardContent>
    </Card>
  )
}

// Product Preview / Mockup Section
function ProductPreviewSection() {
  const features = [
    { icon: MapPinned, label: 'Interactive Map', description: 'See all points of interest' },
    { icon: Navigation, label: 'GPS Navigation', description: 'Get directions to any spot' },
    { icon: Eye, label: 'Proximity Unlock', description: 'Content reveals as you approach' },
    { icon: Zap, label: 'Instant Access', description: 'No app download required' },
  ]

  return (
    <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-stone-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-100/50 to-transparent rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
            See It In Action
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-4">
            Exploration Made{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Beautiful
            </span>
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            A seamless mobile experience that guides guests through your property with interactive maps and location-aware content
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Phone Mockup */}
          <AnimatedSection delay={200}>
            <div className="relative mx-auto max-w-[320px] lg:max-w-none">
              {/* Phone frame */}
              <div className="relative bg-stone-900 rounded-[3rem] p-3 shadow-2xl shadow-stone-900/30">
                {/* Screen */}
                <div className="bg-gradient-to-b from-emerald-50 to-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* Status bar */}
                  <div className="bg-emerald-700 px-6 py-3 flex items-center justify-between">
                    <span className="text-white/90 text-xs font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-white/90 rounded-sm" />
                    </div>
                  </div>

                  {/* App header */}
                  <div className="bg-gradient-to-b from-emerald-700 to-emerald-600 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <TreePine className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Mountain Retreat</p>
                        <p className="text-emerald-100 text-xs">12 spots to discover</p>
                      </div>
                    </div>
                  </div>

                  {/* Map area */}
                  <div className="relative h-48 bg-gradient-to-b from-emerald-100/50 to-teal-50/50">
                    {/* Simulated map elements */}
                    <div className="absolute inset-4">
                      {/* Paths */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <path d="M20,80 Q40,60 50,50 T80,30" stroke="#059669" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.4" />
                        <path d="M10,40 Q30,50 60,45 T90,60" stroke="#0d9488" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.4" />
                      </svg>

                      {/* Map pins */}
                      <div className="absolute top-[20%] left-[30%] w-8 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute top-[50%] left-[60%] w-6 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                        <MapPin className="w-3 h-3 text-white" />
                      </div>
                      <div className="absolute top-[70%] left-[25%] w-6 h-6 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                        <MapPin className="w-3 h-3 text-white" />
                      </div>
                      <div className="absolute top-[35%] right-[15%] w-5 h-5 bg-stone-300 rounded-full flex items-center justify-center opacity-60">
                        <MapPin className="w-2.5 h-2.5 text-stone-500" />
                      </div>

                      {/* User location */}
                      <div className="absolute top-[45%] left-[40%]">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                        <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-30" />
                      </div>
                    </div>
                  </div>

                  {/* Nearby card */}
                  <div className="px-4 py-3">
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-stone-100">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm">Meditation Garden</p>
                          <p className="text-xs text-emerald-600 font-medium">50m away · Unlocked!</p>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">A tranquil space for morning meditation...</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom nav hint */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-300 rounded-full" />
                </div>

                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-stone-900 rounded-full" />
              </div>

              {/* Decorative elements around phone */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl opacity-20 blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full opacity-20 blur-xl" />
            </div>
          </AnimatedSection>

          {/* Features list */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={300 + index * 100}>
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-800 mb-1">{feature.label}</h3>
                    <p className="text-stone-600">{feature.description}</p>
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
      color: 'from-rose-500 to-pink-600',
      shadowColor: 'shadow-rose-500/25',
    },
    {
      icon: Footprints,
      title: 'Wander Freely',
      description: 'Explore the grounds at your own pace with GPS guidance',
      color: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/25',
    },
    {
      icon: Sparkles,
      title: 'Discover More',
      description: 'Hidden content reveals as you approach interesting spots',
      color: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/25',
    },
  ]

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-stone-50/50 to-white" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
            Simple & Intuitive
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            GPS-powered discovery that unfolds naturally as you wander through the property
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, index) => (
            <AnimatedSection key={index} delay={index * 150}>
              <div className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-stone-200 to-transparent" />
                )}

                <div className="text-center p-6">
                  {/* Step number */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border-2 border-stone-200 rounded-full flex items-center justify-center text-xs font-bold text-stone-500 group-hover:border-emerald-500 group-hover:text-emerald-600 transition-colors shadow-sm">
                    {index + 1}
                  </div>

                  <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${step.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-stone-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
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
    <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.15),transparent_50%)]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 group">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                <p className="text-sm text-stone-400">{feature.description}</p>
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
      {/* Floating Demo CTA */}
      <FloatingDemoCTA />

      {/* Cursor glow effect */}
      <CursorGlow />

      {/* Hero Section */}
      <header id="hero-section" className="relative min-h-[90vh] md:min-h-screen flex flex-col bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-700 pt-16 md:pt-20 pb-32 md:pb-40 px-4 overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-transparent" />

        <FloatingElements />

        {/* Mesh gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(20,184,166,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(6,78,59,0.5),transparent_50%)]" />

        <div className="flex-1 flex items-center">
          <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 md:mb-8 border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-100 text-sm font-medium">GPS-Powered Exploration</span>
            </div>

            {/* Animated swaying logo */}
            <AnimatedLogo
              className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8"
              iconClassName="w-10 h-10 md:w-12 md:h-12"
            />

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Wander. Discover.
              <br />
              <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                Experience.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-4">
              GPS-powered exploration for wellness retreats and luxury properties.
              Let your guests discover at their own pace.
            </p>

            {/* Quick Demo Button */}
            <QuickDemoButton />
          </div>
        </div>

        <ScrollIndicator />
      </header>

      {/* Dual Access Cards */}
      <main className="max-w-5xl mx-auto px-4 -mt-20 md:-mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Primary Card - Guest Access (larger) */}
          <div className="lg:col-span-3">
            <AnimatedSection>
              <GuestAccessCard />
            </AnimatedSection>
          </div>
          {/* Secondary Card - Property Portal (smaller) */}
          <div className="lg:col-span-2">
            <AnimatedSection delay={150}>
              <CreatorLoginCard />
            </AnimatedSection>
          </div>
        </div>
      </main>

      {/* Product Preview */}
      <ProductPreviewSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-stone-50 border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                  <TreePine className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="font-bold text-2xl text-stone-800 group-hover:text-emerald-700 transition-colors">Wandernest</span>
              </div>
              <p className="text-sm text-stone-500 text-center md:text-right max-w-md">
                GPS-powered exploration for properties that care about guest experience.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </footer>
    </div>
  )
}
