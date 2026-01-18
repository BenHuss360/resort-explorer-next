'use client'

import { useState, useEffect } from 'react'
import { LandingHeader } from './landing-header'
import { HotspotPreviewCard } from './hotspot-preview-card'
import { CTABadge } from './cta-badge'

// Hero background images for carousel
const heroImages = [
  '/tuscanyhero.png',
  '/englishcountryside.png',
  '/heroskiresorthero.png',
]

// Themed hotspot data for each hero image
const themedHotspots = [
  // Tuscany theme
  {
    featured: {
      title: 'Vineyard Terrace',
      description:
        'Savor the golden hour among ancient vines. A timeless spot for wine tasting and sunset views.',
      audioDuration: '3:24',
      imageUrl: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=400&h=300&fit=crop',
    },
    secondary: {
      title: 'Villa Garden',
      description: 'Wander through centuries-old olive trees and fragrant herb gardens.',
      audioDuration: '2:12',
      imageUrl: 'https://images.unsplash.com/photo-1762850106707-a9c07400cac2?w=400&h=300&fit=crop',
    },
  },
  // English Countryside theme
  {
    featured: {
      title: 'Manor Gardens',
      description:
        'Explore our award-winning English gardens. Discover hidden paths, topiaries, and the iconic rose walk.',
      audioDuration: '4:05',
      imageUrl: 'https://images.unsplash.com/photo-1582542021985-549ba224e01b?w=400&h=300&fit=crop',
    },
    secondary: {
      title: 'Riverside Path',
      description: 'A peaceful trail along the estate river, perfect for morning strolls.',
      audioDuration: '2:30',
      imageUrl: 'https://images.unsplash.com/photo-1675770070481-3ada9bbb3c47?w=400&h=300&fit=crop',
    },
  },
  // Ski Resort theme
  {
    featured: {
      title: 'Alpine Summit',
      description:
        'Experience panoramic views from our highest peak. Perfect for sunrise photography and après-ski relaxation.',
      audioDuration: '2:48',
      imageUrl: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&h=300&fit=crop',
    },
    secondary: {
      title: 'Chairlift Vista',
      description: 'Scenic views along our historic chairlift route through the pines.',
      audioDuration: '1:55',
      imageUrl: 'https://images.unsplash.com/photo-1749151068114-14fa7a506c52?w=400&h=300&fit=crop',
    },
  },
]

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

// Mobile headline for value proposition visibility - positioned in parchment area
function MobileHeadline() {
  return (
    <div className="md:hidden absolute inset-x-0 bottom-24 z-30 px-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-1.5">
        <div className="w-8 h-0.5 bg-[#c9a227]" />
        <span className="text-[11px] uppercase tracking-widest text-[#5a4a3a] font-bold">
          GPS Discovery
        </span>
        <div className="w-8 h-0.5 bg-[#c9a227]" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#3a3025] leading-tight">
        Stories Around Every Corner
      </h1>
    </div>
  )
}

// Decorative vintage border for treasure map aesthetic
function DecorativeBorder({ position }: { position: 'top' | 'bottom' }) {
  const isTop = position === 'top'

  return (
    <div
      className={`absolute left-0 right-0 z-30 pointer-events-none ${
        isTop ? 'top-[72px]' : 'bottom-0'
      }`}
    >
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        className={`w-full h-8 md:h-10 ${isTop ? '' : 'rotate-180'}`}
      >
        {/* Parchment base band */}
        <rect x="0" y="0" width="1440" height="40" fill="#F5F0E6" fillOpacity="0.85" />

        {/* Decorative wave pattern */}
        <path
          d="M0,20 Q60,8 120,20 T240,20 T360,20 T480,20 T600,20 T720,20 T840,20 T960,20 T1080,20 T1200,20 T1320,20 T1440,20"
          stroke="#d4c4a8"
          strokeWidth="2"
          fill="none"
        />

        {/* Gold accent line */}
        <path
          d="M0,28 Q60,22 120,28 T240,28 T360,28 T480,28 T600,28 T720,28 T840,28 T960,28 T1080,28 T1200,28 T1320,28 T1440,28"
          stroke="#FFD27F"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />

        {/* Corner flourishes */}
        <circle cx="40" cy="20" r="4" fill="#d4c4a8" />
        <circle cx="1400" cy="20" r="4" fill="#d4c4a8" />

        {/* Center ornament */}
        <g transform="translate(720, 20)">
          <circle r="6" fill="#FFD27F" opacity="0.8" />
          <circle r="3" fill="#d4c4a8" />
        </g>

        {/* Gradient fade at edges */}
        <defs>
          <linearGradient id={`fadeGradient-${position}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5F0E6" stopOpacity={isTop ? "0" : "0.9"} />
            <stop offset="100%" stopColor="#F5F0E6" stopOpacity={isTop ? "0.9" : "0"} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1440" height="40" fill={`url(#fadeGradient-${position})`} />
      </svg>
    </div>
  )
}


interface HeroSectionProps {
  heroImageUrl?: string
}

export function HeroSection({ heroImageUrl }: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Cycle through hero images
  useEffect(() => {
    if (heroImageUrl) return // Don't carousel if a specific image is provided

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000) // Change image every 6 seconds

    return () => clearInterval(interval)
  }, [heroImageUrl])

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Header */}
      <LandingHeader />

      {/* Background - Hero Image Carousel or Single Image */}
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt="Aerial view of resort property"
            className="w-full h-full object-cover"
          />
        ) : (
          // Fading carousel of hero images
          <div className="relative w-full h-full">
            {heroImages.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Resort destination ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
                style={{
                  opacity: index === currentImageIndex ? 1 : 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Dark overlay at top for header blend */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#2F4F4F]/50 to-transparent" />

        {/* Parchment frame - bottom border only */}
        <div className="absolute inset-x-0 bottom-0 h-44 md:h-56 bg-gradient-to-t from-[#c9b896] via-[#d4c4a8]/90 to-transparent" />

        {/* Parchment texture overlay on borders */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Grain texture overlay */}
      <GrainOverlay />

      {/* Decorative borders */}
      <DecorativeBorder position="top" />
      <DecorativeBorder position="bottom" />

      {/* Mobile headline */}
      <MobileHeadline />

      {/* CTA Badge - centered on mobile, left-aligned on desktop */}
      <div className="absolute z-40 left-1/2 -translate-x-1/2 bottom-14 md:left-6 md:translate-x-0 md:bottom-8 lg:left-12 lg:bottom-12">
        <CTABadge
          className="animate-ctaBadgePopIn"
          style={{ '--pop-delay': '1.5s' } as React.CSSProperties}
        />
      </div>

      {/* Hotspot Preview Cards - Right side, stacked with overlap (hidden on mobile, shown below hero instead) */}
      {/* Renders all themed card sets and fades between them in sync with background */}
      <div className="absolute hidden sm:flex sm:right-6 sm:bottom-auto sm:top-[55%] sm:-translate-y-1/2 lg:right-12 z-20 flex-col">
        {themedHotspots.map((theme, index) => (
          <div
            key={index}
            className="transition-opacity duration-[1500ms] ease-in-out"
            style={{
              opacity: index === currentImageIndex ? 1 : 0,
              position: index === 0 ? 'relative' : 'absolute',
              top: index === 0 ? undefined : 0,
              right: index === 0 ? undefined : 0,
              pointerEvents: index === currentImageIndex ? 'auto' : 'none',
            }}
          >
            <HotspotPreviewCard
              {...theme.featured}
              variant="featured"
              onWatchVideo={() => {}}
              className="animate-heroCardPopIn relative z-10"
              style={{ '--pop-delay': '1.6s' } as React.CSSProperties}
            />
            <HotspotPreviewCard
              {...theme.secondary}
              variant="secondary"
              hasVideo={false}
              className="hidden md:block animate-heroCardPopIn -mt-4 ml-4 relative z-0"
              style={{ '--pop-delay': '1.8s' } as React.CSSProperties}
            />
          </div>
        ))}
      </div>

    </section>
  )
}
