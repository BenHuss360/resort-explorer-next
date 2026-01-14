'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Boundaries, CustomMapOverlay, MapExperience } from '@/lib/db/schema'

// Mock project for development - replace with real auth later
// Default location: Appletrees, Castle Cary, BA7 7PQ
const MOCK_PROJECT: ProjectContextData = {
  id: 1,
  resortName: 'Appletrees',
  accessCode: 'APPLE24',
  homepageContent: 'Welcome to Appletrees!',
  mapExperience: 'full',
  boundaries: {
    north: 51.0968,
    south: 51.0948,
    east: -2.5343,
    west: -2.5363,
  },
  customMapOverlay: {
    imageUrl: null,
    northLat: null,
    southLat: null,
    westLng: null,
    eastLng: null,
    opacity: 0.8,
    enabled: false,
  },
  venueLocation: {
    latitude: 51.0958,
    longitude: -2.5353,
  },
}

export interface VenueLocation {
  latitude: number | null
  longitude: number | null
}

export interface ProjectContextData {
  id: number
  resortName: string
  accessCode: string
  homepageContent: string
  mapExperience: MapExperience
  boundaries: Boundaries
  customMapOverlay: CustomMapOverlay
  venueLocation: VenueLocation
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
          accessCode: data.accessCode,
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
            opacity: data.customMapOpacity || 0.8,
            enabled: data.customMapEnabled || false,
          },
          venueLocation: {
            latitude: data.venueLocationLat,
            longitude: data.venueLocationLng,
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

  // On mount, load project from API
  useEffect(() => {
    // For development, use mock project ID 1
    fetchProject(1).then(() => setIsLoading(false))
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
  }, [project?.id, fetchProject])

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
