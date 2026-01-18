'use client'

interface CTABadgeProps {
  className?: string
}

export function CTABadge({ className = '' }: CTABadgeProps) {
  return (
    <div className={`bg-[#F5F0E6] rounded-2xl p-6 shadow-2xl border border-[#FFD27F]/30 max-w-xs ${className}`}>
      {/* Logo and brand */}
      <div className="flex items-center gap-3 mb-4">
        <img src="/wnlogo.svg" alt="WanderNest" className="h-12 w-auto" />
        <span className="font-bold text-[#2F4F4F] text-lg">WanderNest</span>
      </div>

      {/* Tagline */}
      <p className="text-[#708090] leading-relaxed text-sm">
        Discover the beauty of our retreat through GPS-powered exploration.
      </p>

      {/* Gold accent */}
      <div className="w-12 h-0.5 bg-[#FFD27F] mt-4" />
    </div>
  )
}
