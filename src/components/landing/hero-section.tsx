'use client'

import { useState, useEffect } from 'react'
import { LandingHeader } from './landing-header'
import { HotspotPreviewCard } from './hotspot-preview-card'
import { CTABadge } from './cta-badge'

// Grain texture overlay
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

// Scroll indicator
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
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 z-20 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="text-[#F5F0E6]/70 text-xs font-medium tracking-wider uppercase">
        Scroll to explore
      </span>
      <div className="w-6 h-10 rounded-full border-2 border-[#F5F0E6]/30 flex items-start justify-center p-1">
        <div className="w-1.5 h-3 bg-[#FFD27F]/70 rounded-full animate-scrollBounce" />
      </div>
    </div>
  )
}

interface HeroSectionProps {
  heroImageUrl?: string
}

export function HeroSection({ heroImageUrl }: HeroSectionProps) {

  // Demo hotspot data
  const featuredHotspot = {
    title: 'Hilltop Viewpoint',
    description:
      'Enjoy a breathtaking panorama from our hilltop lookout. A perfect spot to relax and take in the sunset.',
    audioDuration: '3:12',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  }

  const secondaryHotspot = {
    title: 'Lakeside Pavilion',
    description: 'Relax by the water\'s edge in our tranquil lakeside pavilion.',
    audioDuration: '2:45',
    imageUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop',
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Header */}
      <LandingHeader />

      {/* Background - Hero Image or Gradient Placeholder */}
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt="Aerial view of resort property"
            className="w-full h-full object-cover"
          />
        ) : (
          // Gradient placeholder with decorative elements
          <div className="w-full h-full bg-gradient-to-br from-[#4a7c59] via-[#3d6b4f] to-[#2d5a3f]">
            {/* Soft terrain shapes */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
            >
              <ellipse cx="200" cy="700" rx="400" ry="200" fill="#c5d9a4" opacity="0.15" />
              <ellipse cx="1200" cy="300" rx="300" ry="180" fill="#c5d9a4" opacity="0.12" />
              <ellipse cx="700" cy="800" rx="500" ry="150" fill="#a8d4e6" opacity="0.1" />
              <path
                d="M0,600 Q300,550 600,600 T1200,580 T1440,620"
                stroke="#d4d0c8"
                strokeWidth="3"
                fill="none"
                opacity="0.15"
              />
            </svg>
          </div>
        )}

        {/* Warm overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2F4F4F]/40 via-transparent to-[#F5F0E6]/60" />

        {/* Parchment texture at edges */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F0E6]/20 via-transparent to-[#F5F0E6]/20" />
      </div>

      {/* Grain texture overlay */}
      <GrainOverlay />


      {/* CTA Badge - Lower left (hidden on mobile) */}
      <div className="absolute left-6 lg:left-12 bottom-24 lg:bottom-32 z-20 hidden md:block">
        <CTABadge className="animate-cardFloat" />
      </div>

      {/* Hotspot Preview Cards - Right side, stacked with overlap */}
      <div className="absolute right-4 sm:right-6 lg:right-12 bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-20 flex flex-col">
        <HotspotPreviewCard
          {...featuredHotspot}
          variant="featured"
          onWatchVideo={() => {}}
          className="animate-cardFloat relative z-10"
        />
        <HotspotPreviewCard
          {...secondaryHotspot}
          variant="secondary"
          hasVideo={false}
          className="hidden md:block animate-cardFloat [animation-delay:0.5s] -mt-4 ml-4 relative z-0"
        />
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator />

      {/* Custom animations */}
      <style jsx>{`
        @keyframes scrollBounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(12px);
            opacity: 0.3;
          }
        }
        .animate-scrollBounce {
          animation: scrollBounce 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
