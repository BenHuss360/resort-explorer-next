'use client'

export function LandingHeader() {
  return (
    <header className="absolute top-0 inset-x-0 z-50 bg-[#2F4F4F] px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/wnlogo.svg" alt="WanderNest" className="h-8 w-auto" />
          <span className="font-bold text-xl text-[#F5F0E6]">WanderNest</span>
        </div>

        {/* Gold accent line - decorative */}
        <div className="hidden md:block flex-1 mx-8">
          <div className="w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-[#FFD27F]/40 to-transparent mx-auto" />
        </div>

        {/* CTA link */}
        <a
          href="#for-properties"
          className="text-sm text-[#F5F0E6]/80 hover:text-[#FFD27F] transition-colors font-medium"
        >
          For Properties
        </a>
      </div>
    </header>
  )
}
