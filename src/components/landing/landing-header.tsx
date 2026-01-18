'use client'

import { useState } from 'react'
import { SignInModal } from '@/components/modals/sign-in-modal'

export function LandingHeader() {
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <header className="absolute top-0 inset-x-0 z-50">
      {/* Main header content */}
      <div className="bg-[#2F4F4F] px-4 md:px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-center relative">
          {/* Logo - Centered */}
          <div className="flex items-center gap-3">
            <img src="/wnlogo.svg" alt="WanderNest" className="h-12 w-auto" />
            <span className="font-bold text-2xl text-[#F5F0E6]">WanderNest</span>
          </div>

          {/* CTA link - Right side */}
          <button
            onClick={() => setShowSignIn(true)}
            className="absolute right-0 text-sm text-[#F5F0E6]/80 hover:text-[#FFD27F] transition-colors font-medium"
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Decorative gold accent line at bottom */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#FFD27F]/70 to-transparent" />

      {/* Sign in modal */}
      <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
    </header>
  )
}
