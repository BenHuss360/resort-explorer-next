'use client'

import { useEffect } from 'react'
import { loadGoogleFonts } from '@/lib/font-loader'

interface GoogleFontsLoaderProps {
  fonts: string[]
}

/**
 * Component that loads Google Fonts dynamically.
 * Add this component anywhere in your tree and pass the font names to load.
 */
export function GoogleFontsLoader({ fonts }: GoogleFontsLoaderProps) {
  useEffect(() => {
    loadGoogleFonts(fonts)
  }, [fonts])

  return null
}
