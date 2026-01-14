import type { Project, Hotspot } from '@/lib/db/schema'
import type { ProjectContextData } from '@/components/providers/project-provider'

// Demo project for creator mode - uses Central Park NYC as a recognizable location
export const DEMO_PROJECT: ProjectContextData = {
  id: 999999,
  resortName: 'Demo Resort Experience',
  accessCode: 'DEMO',
  homepageContent: 'Welcome to the Demo Resort Experience! Explore our interactive map to discover all the amazing locations and hidden gems throughout the property.',
  mapExperience: 'full',
  boundaries: {
    north: 40.7850,
    south: 40.7644,
    east: -73.9490,
    west: -73.9815,
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
}

// Sample hotspots for demo mode
export const DEMO_HOTSPOTS: Hotspot[] = [
  {
    id: 999001,
    projectId: 999999,
    title: 'Welcome Center',
    description: 'Start your journey here! Our welcome center provides maps, information about the resort, and helpful staff ready to assist you with anything you need.',
    latitude: 40.7736,
    longitude: -73.9712,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    audioUrl: null,
    markerColor: '#3B82F6',
    markerType: 'pin',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'clock', title: 'Hours', subtitle: '8 AM - 8 PM' },
      { icon: 'phone', title: 'Contact', subtitle: '(555) 123-4567' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 999002,
    projectId: 999999,
    title: 'The Grand Pool',
    description: 'Relax at our stunning infinity pool with panoramic views. Towels and loungers are provided. Poolside service available from 10 AM to sunset.',
    latitude: 40.7695,
    longitude: -73.9750,
    imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
    audioUrl: null,
    markerColor: '#059669',
    markerType: 'circle',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'droplets', title: 'Temperature', subtitle: '82°F / 28°C' },
      { icon: 'sun', title: 'Best Time', subtitle: 'Afternoon' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 999003,
    projectId: 999999,
    title: 'Secret Garden',
    description: 'A hidden gem tucked away behind the main building. Perfect for quiet reflection, reading, or a romantic stroll. Features rare botanical specimens from around the world.',
    latitude: 40.7770,
    longitude: -73.9680,
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    audioUrl: null,
    markerColor: '#DC2626',
    markerType: 'star',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'leaf', title: 'Season', subtitle: 'Best in Spring' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 999004,
    projectId: 999999,
    title: 'Sunset Terrace Restaurant',
    description: 'Fine dining with breathtaking sunset views. Our award-winning chef prepares farm-to-table cuisine using locally sourced ingredients. Reservations recommended.',
    latitude: 40.7720,
    longitude: -73.9620,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    audioUrl: null,
    markerColor: '#F59E0B',
    markerType: 'diamond',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'utensils', title: 'Cuisine', subtitle: 'Contemporary' },
      { icon: 'star', title: 'Rating', subtitle: '4.8 Stars' },
      { icon: 'clock', title: 'Dinner', subtitle: '5 PM - 10 PM' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
]

// Check if we're in demo mode
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem('demoMode') === 'true'
  } catch {
    return false
  }
}

// Set up demo mode
export function activateDemoMode() {
  if (typeof window === 'undefined') return
  localStorage.setItem('demoMode', 'true')
  localStorage.setItem('currentProject', JSON.stringify(DEMO_PROJECT))
}

// Clear demo mode
export function clearDemoMode() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('demoMode')
}
