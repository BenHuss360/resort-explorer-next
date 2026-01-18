'use client'

interface CTABadgeProps {
  className?: string
  style?: React.CSSProperties
}

export function CTABadge({ className = '', style }: CTABadgeProps) {
  return (
    <div className={`flex flex-col items-center md:flex-row md:items-start gap-2 md:gap-4 ${className}`} style={style}>
      {/* Pin icon in rounded container - hidden on mobile */}
      <div className="hidden md:block bg-[#F5F0E6]/90 rounded-xl p-3 shadow-lg border border-[#FFD27F]/20">
        <img src="/wnlogo.svg" alt="" className="h-8 w-auto" />
      </div>

      {/* Value prop text - shorter on mobile */}
      <p className="text-[#3a3025] font-semibold text-[13px] md:text-base leading-tight text-center md:text-left md:pt-2 max-w-[180px] md:max-w-[180px]">
        Secrets worth finding
      </p>
    </div>
  )
}
