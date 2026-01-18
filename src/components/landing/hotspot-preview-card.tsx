'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HotspotPreviewCardProps {
  title: string
  description: string
  imageUrl?: string
  audioUrl?: string
  audioDuration?: string
  hasVideo?: boolean
  variant?: 'featured' | 'secondary'
  onWatchVideo?: () => void
  className?: string
}

export function HotspotPreviewCard({
  title,
  description,
  imageUrl,
  audioUrl,
  audioDuration = '3:12',
  hasVideo = true,
  variant = 'featured',
  onWatchVideo,
  className = '',
}: HotspotPreviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
          setProgress(pct)
        }
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setProgress(0)
      })
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioUrl])

  const toggleAudio = () => {
    if (!audioRef.current) {
      // Demo mode - animate progress without actual audio
      setIsPlaying(!isPlaying)
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Demo progress animation when no audio
  useEffect(() => {
    if (isPlaying && !audioUrl) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.5
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isPlaying, audioUrl])

  const isFeatured = variant === 'featured'

  // Secondary card - compact horizontal layout
  if (!isFeatured) {
    return (
      <div
        className={`
          bg-[#F5F0E6] rounded-2xl overflow-hidden shadow-2xl shadow-[#2F4F4F]/20
          border border-[#2F4F4F]/10 hover:border-[#FFD27F]/50
          transition-all duration-300 hover:scale-[1.02]
          max-w-xs
          ${className}
        `}
      >
        <div className="flex gap-3 p-3">
          {/* Thumbnail image */}
          <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#4a7c59] via-[#3d6b4f] to-[#2d5a3f]" />
            )}
          </div>
          {/* Text content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="font-semibold text-sm text-[#2F4F4F] leading-tight">{title}</h4>
            <p className="text-xs text-[#708090] line-clamp-2 mt-1">{description}</p>
          </div>
          {/* Play button */}
          <button
            onClick={toggleAudio}
            className="w-8 h-8 rounded-full bg-[#2F4F4F] text-[#F5F0E6] flex items-center justify-center hover:bg-[#3a5f5f] transition-all flex-shrink-0 self-center"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    )
  }

  // Featured card - vertical layout with full content
  return (
    <div
      className={`
        bg-[#F5F0E6] rounded-2xl overflow-hidden shadow-2xl shadow-[#2F4F4F]/20
        border border-[#2F4F4F]/10 hover:border-[#FFD27F]/50
        transition-all duration-300 hover:scale-[1.02]
        max-w-sm
        ${className}
      `}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-32">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#4a7c59] via-[#3d6b4f] to-[#2d5a3f]">
            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F0E6]/20 to-transparent" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5F0E6]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Header with gold bar */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-[#FFD27F]" />
          <span className="text-[10px] uppercase tracking-wider text-[#708090] font-medium">
            Point of Interest
          </span>
        </div>

        {/* Title */}
        <h4 className="font-bold text-lg text-[#2F4F4F] leading-tight">
          {title}
        </h4>

        {/* Description */}
        <p className="text-sm text-[#708090] leading-relaxed">
          {description}
        </p>

        {/* Audio Player */}
        <div className="bg-white/60 rounded-xl p-3 border border-[#FFD27F]/30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className="w-10 h-10 rounded-full bg-[#2F4F4F] text-[#F5F0E6] flex items-center justify-center hover:bg-[#3a5f5f] transition-all shadow-lg flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#2F4F4F]">Audio Guide</p>
              <div className="h-1.5 bg-[#2F4F4F]/10 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#FFD27F] rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-[#708090] font-medium">{audioDuration}</span>
          </div>
        </div>

        {/* Watch Video Button */}
        {hasVideo && (
          <Button
            onClick={onWatchVideo}
            className="w-full bg-[#d4a84b] hover:bg-[#c49a3d] text-white font-medium transition-all"
          >
            <Video className="w-4 h-4 mr-2" />
            Watch Video
          </Button>
        )}
      </div>
    </div>
  )
}
