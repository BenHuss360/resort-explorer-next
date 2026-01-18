'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Boundaries, CustomMapOverlay, MapExperience, EmbedSettings, BrandColors, BrandFonts } from '@/lib/db/schema'
import { BRAND_DEFAULTS } from '@/lib/db/schema'
import { isDemoMode, DEMO_PROJECT } from '@/lib/mock-data'

export interface VenueLocation {
  latitude: number | null
  longitude: number | null
}

export interface ProjectContextData {
  id: number
  resortName: string
  slug: string
  homepageContent: string
  mapExperience: MapExperience
  boundaries: Boundaries
  customMapOverlay: CustomMapOverlay
  venueLocation: VenueLocation
  embedSettings: EmbedSettings
  brandColors: BrandColors
  brandFonts: BrandFonts
}

interface ProjectContextType {
  project: ProjectContextData | null
  setProject: (project: ProjectContextData | null) => void
  refreshProject: () => Promise<void>
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProjectState] = useState<ProjectContextData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProject = useCallback(async (projectId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (res.ok) {
        const data = await res.json()
        const projectData: ProjectContextData = {
          id: data.id,
          resortName: data.resortName,
          slug: data.slug,
          homepageContent: data.homepageContent || '',
          mapExperience: data.mapExperience || 'full',
          boundaries: {
            north: data.northBoundary,
            south: data.southBoundary,
            east: data.eastBoundary,
            west: data.westBoundary,
          },
          customMapOverlay: {
            imageUrl: data.customMapImageUrl,
            northLat: data.customMapNorthLat,
            southLat: data.customMapSouthLat,
            westLng: data.customMapWestLng,
            eastLng: data.customMapEastLng,
            opacity: data.customMapOpacity ?? 1.0,
            enabled: data.customMapEnabled || false,
            gcps: data.customMapGCPs || [],
            calibrationMode: data.customMapCalibrationMode || '2corners',
          },
          venueLocation: {
            latitude: data.venueLocationLat,
            longitude: data.venueLocationLng,
          },
          embedSettings: {
            showHeader: data.embedShowHeader ?? true,
            showBranding: data.embedShowBranding ?? true,
          },
          brandColors: {
            primary: data.brandPrimaryColor || BRAND_DEFAULTS.primaryColor,
            secondary: data.brandSecondaryColor || BRAND_DEFAULTS.secondaryColor,
          },
          brandFonts: {
            primary: data.brandPrimaryFont || BRAND_DEFAULTS.primaryFont,
            secondary: data.brandSecondaryFont || BRAND_DEFAULTS.secondaryFont,
          },
        }
        setProjectState(projectData)
        return projectData
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
    return null
  }, [])

  // On mount, load project from API or use demo data
  useEffect(() => {
    // Check if in demo mode first
    if (isDemoMode()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: initialization on mount
      setProjectState(DEMO_PROJECT as ProjectContextData)
      setIsLoading(false)
      return
    }

    // Otherwise try API
    fetchProject(1).then((result) => {
      if (!result) {
        // Use demo project as fallback if API fails
        setProjectState(DEMO_PROJECT as ProjectContextData)
      }
      setIsLoading(false)
    })
  }, [fetchProject])

  const setProject = (project: ProjectContextData | null) => {
    setProjectState(project)
    if (project) {
      localStorage.setItem('currentProject', JSON.stringify(project))
    } else {
      localStorage.removeItem('currentProject')
    }
  }

  const refreshProject = useCallback(async () => {
    if (project?.id) {
      await fetchProject(project.id)
    }
  }, [project, fetchProject])

  return (
    <ProjectContext.Provider value={{ project, setProject, refreshProject, isLoading }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
