'use client'

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
        Explore Every Corner
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
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
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
      <div className="absolute hidden sm:flex sm:right-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 lg:right-12 z-20 flex-col">
        <HotspotPreviewCard
          {...featuredHotspot}
          variant="featured"
          onWatchVideo={() => {}}
          className="animate-heroCardPopIn relative z-10"
          style={{ '--pop-delay': '1.6s' } as React.CSSProperties}
        />
        <HotspotPreviewCard
          {...secondaryHotspot}
          variant="secondary"
          hasVideo={false}
          className="hidden md:block animate-heroCardPopIn -mt-4 ml-4 relative z-0"
          style={{ '--pop-delay': '1.8s' } as React.CSSProperties}
        />
      </div>

    </section>
  )
}
