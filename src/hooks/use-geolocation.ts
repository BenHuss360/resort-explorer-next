'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface GeolocationState {
  location: GeolocationPosition | null
  error: string | null
  isLoading: boolean
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
  } = options

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: true,
  })

  const watchIdRef = useRef<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      location: position,
      error: null,
      isLoading: false,
    })
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location services in your browser/device settings.'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable. Make sure GPS/Location is enabled on your device.'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.'
        break
      default:
        errorMessage = 'An unknown error occurred.'
    }

    setState({
      location: null,
      error: errorMessage,
      isLoading: false,
    })
  }, [])

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    setRetryCount(c => c + 1)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation is not supported by this browser.',
        isLoading: false,
      })
      return
    }

    // Clear previous watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, retryCount])

  return { ...state, retry }
}
