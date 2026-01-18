'use client'

interface CTABadgeProps {
  className?: string
}

export function CTABadge({ className = '' }: CTABadgeProps) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {/* Pin icon in rounded container */}
      <div className="bg-[#F5F0E6]/90 rounded-xl p-3 shadow-lg border border-[#FFD27F]/20">
        <img src="/wnlogo.svg" alt="" className="h-8 w-auto" />
      </div>

      {/* Value prop text */}
      <p className="text-[#2F4F4F] font-medium text-base leading-snug pt-2 max-w-[180px]">
        Give your guests something to discover
      </p>
    </div>
  )
}
