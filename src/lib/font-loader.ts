import { AVAILABLE_FONTS } from '@/lib/db/schema'

/**
 * Generates a Google Fonts URL for the given font names.
 * Returns null if no custom fonts need to be loaded.
 */
export function getGoogleFontsUrl(fonts: string[]): string | null {
  // Filter out 'default' and any invalid fonts
  const validFonts = fonts.filter(
    (font) =>
      font !== 'default' &&
      (AVAILABLE_FONTS.headings.includes(font as (typeof AVAILABLE_FONTS.headings)[number]) ||
        AVAILABLE_FONTS.body.includes(font as (typeof AVAILABLE_FONTS.body)[number]))
  )

  if (validFonts.length === 0) return null

  // Remove duplicates
  const uniqueFonts = [...new Set(validFonts)]

  // Format for Google Fonts API: family=Font+Name:wght@400;500;600;700
  const fontParams = uniqueFonts
    .map((font) => {
      const encodedName = font.replace(/\s+/g, '+')
      return `family=${encodedName}:wght@400;500;600;700`
    })
    .join('&')

  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`
}

/**
 * Dynamically loads Google Fonts by injecting a link element.
 * Safe to call multiple times with the same fonts.
 */
export function loadGoogleFonts(fonts: string[]): void {
  if (typeof window === 'undefined') return

  const url = getGoogleFontsUrl(fonts)
  if (!url) return

  // Check if already loaded
  const existingLink = document.querySelector(`link[href="${url}"]`)
  if (existingLink) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}
