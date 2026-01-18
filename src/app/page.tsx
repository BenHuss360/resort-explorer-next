'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import { Map, Sparkles, Smartphone, Zap, Eye, Navigation, Footprints } from 'lucide-react'
import { HeroSection } from '@/components/landing/hero-section'
import { PropertiesCTA } from '@/components/landing/properties-cta'

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
  delay = 0,
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

// How It Works Section - Updated copy
function HowItWorksSection() {
  const steps = [
    {
      icon: Map,
      title: 'See Your Map',
      description: 'All the places worth discovering, at a glance',
      color: 'from-[#FFD27F] to-[#f5c55a]',
      shadowColor: 'shadow-[#FFD27F]/25',
    },
    {
      icon: Footprints,
      title: 'Wander Freely',
      description: 'Explore at your own pace with GPS guidance',
      color: 'from-[#2F4F4F] to-[#3a5f5f]',
      shadowColor: 'shadow-[#2F4F4F]/25',
    },
    {
      icon: Sparkles,
      title: 'Unlock Stories',
      description: 'Audio, video, and details reveal as you approach',
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
            GPS-powered discovery that unfolds naturally as you explore the property
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

                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${step.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <step.icon className="w-12 h-12 text-[#F5F0E6]" />
                  </div>
                  <h3 className="font-bold text-xl text-[#2F4F4F] mb-3">{step.title}</h3>
                  <p className="text-[#708090] leading-relaxed">{step.description}</p>
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
    { icon: Smartphone, title: 'No App Download', description: 'Works in browser or integrates into your app' },
    { icon: Zap, title: 'Works Offline', description: 'Content cached for spotty signal areas' },
    { icon: Eye, title: 'Privacy First', description: 'Location data never leaves your device' },
    {
      icon: Navigation,
      title: 'Instant Access',
      description: 'Just open the link and start exploring',
    },
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

// Footer
function Footer() {
  return (
    <footer className="py-12 md:py-16 bg-[#F5F0E6] border-t border-[#2F4F4F]/10">
      <div className="max-w-5xl mx-auto px-4">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img
                src="/wnlogo.svg"
                alt="WanderNest"
                className="h-12 w-auto group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-bold text-2xl text-[#2F4F4F] group-hover:text-[#3a5f5f] transition-colors">
                Wandernest
              </span>
            </div>
            <p className="text-sm text-[#708090] text-center md:text-right max-w-md">
              GPS-powered exploration for properties that care about guest experience.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  )
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Grain texture overlay */}
      <GrainOverlay />

      {/* Hero Section */}
      <HeroSection heroImageUrl="/herobackground.png" />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features */}
      <FeaturesSection />

      {/* For Properties CTA */}
      <PropertiesCTA />

      {/* Footer */}
      <Footer />
    </div>
  )
}
