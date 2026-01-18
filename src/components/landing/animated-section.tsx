'use client'

import { useRef, useEffect, useState, ReactNode, useCallback } from 'react'

// Shared IntersectionObserver instance for better performance
// Uses a Map to track callbacks for each observed element
// NOTE: All usages must use the same threshold (0.1) since the observer
// is created once with the first threshold value and reused thereafter
let sharedObserver: IntersectionObserver | null = null
const observerCallbacks = new Map<Element, (isIntersecting: boolean) => void>()

function getSharedObserver(threshold: number = 0.1): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = observerCallbacks.get(entry.target)
          if (callback) {
            callback(entry.isIntersecting)
          }
        })
      },
      { threshold }
    )
  }
  return sharedObserver
}

// Scroll animation hook using shared observer
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const handleIntersection = useCallback((isIntersecting: boolean) => {
    if (isIntersecting) {
      setIsVisible(true)
      // Unobserve after becoming visible (one-time animation)
      if (ref.current) {
        const observer = getSharedObserver(threshold)
        observer.unobserve(ref.current)
        observerCallbacks.delete(ref.current)
      }
    }
  }, [threshold])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = getSharedObserver(threshold)
    observerCallbacks.set(element, handleIntersection)
    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observerCallbacks.delete(element)
    }
  }, [threshold, handleIntersection])

  return { ref, isVisible }
}

// Animated section wrapper
export function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      {children}
    </div>
  )
}
