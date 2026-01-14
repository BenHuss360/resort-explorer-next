import type { Project, Hotspot } from '@/lib/db/schema'
import type { ProjectContextData } from '@/components/providers/project-provider'

// Demo project for creator mode - uses The Newt in Somerset as a real-world example
export const DEMO_PROJECT: ProjectContextData = {
  id: 999999,
  resortName: 'The Newt in Somerset',
  accessCode: 'DEMO',
  homepageContent: 'Welcome to The Newt in Somerset! Explore our working country estate with beautiful gardens, farm experiences, and exceptional dining. Discover all our hotspots on the interactive map.',
  mapExperience: 'full',
  boundaries: {
    north: 51.0920,
    south: 51.0790,
    east: -2.4780,
    west: -2.5000,
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
    latitude: 51.0850,
    longitude: -2.4880,
  },
}

// Sample hotspots for demo mode - based on The Newt in Somerset attractions
export const DEMO_HOTSPOTS: Hotspot[] = [
  {
    id: 999001,
    projectId: 999999,
    title: 'The Walled Garden',
    description: 'Explore our magnificent Victorian walled garden, restored to its former glory. Discover heritage apple varieties, espaliered fruit trees, and vibrant seasonal plantings across colour-themed rooms.',
    latitude: 51.0860,
    longitude: -2.4875,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    audioUrl: null,
    markerColor: '#059669',
    markerType: 'pin',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'leaf', title: 'Highlight', subtitle: '265 Apple Varieties' },
      { icon: 'clock', title: 'Best Time', subtitle: 'Spring & Autumn' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 999002,
    projectId: 999999,
    title: 'The Parabola',
    description: 'A sweeping curved orchard featuring over 460 apple trees arranged in an elegant parabolic shape. Walk through rows of heritage cider apples and take in the stunning Somerset countryside views.',
    latitude: 51.0845,
    longitude: -2.4870,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    audioUrl: null,
    markerColor: '#DC2626',
    markerType: 'circle',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'apple', title: 'Trees', subtitle: '460+ Heritage Apples' },
      { icon: 'map', title: 'Feature', subtitle: 'Panoramic Views' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 999003,
    projectId: 999999,
    title: 'The Farmyard',
    description: 'Meet our friendly farm animals including rare breed pigs, sheep, chickens, and goats. Perfect for families, the farmyard brings traditional farming to life with daily feeding times and interactive experiences.',
    latitude: 51.0855,
    longitude: -2.4920,
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
    audioUrl: null,
    markerColor: '#F59E0B',
    markerType: 'star',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'heart', title: 'Family', subtitle: 'Kid Friendly' },
      { icon: 'clock', title: 'Feeding', subtitle: '11 AM & 3 PM' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 999004,
    projectId: 999999,
    title: 'The Cyder Press',
    description: 'Our working cyder press and tasting room. Sample award-winning cyders made from estate-grown apples, learn about traditional cyder-making, and browse our farm shop for local Somerset produce.',
    latitude: 51.0870,
    longitude: -2.4895,
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
    audioUrl: null,
    markerColor: '#8B5CF6',
    markerType: 'diamond',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'wine', title: 'Tastings', subtitle: 'Daily from 10 AM' },
      { icon: 'shopping-bag', title: 'Shop', subtitle: 'Local Produce' },
    ],
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 999005,
    projectId: 999999,
    title: 'The Woodland Walk',
    description: 'Meander through ancient woodland along peaceful trails. Discover hidden sculptures, wildlife habitats, and the tranquil Mushroom Log where shiitake and oyster mushrooms are cultivated.',
    latitude: 51.0890,
    longitude: -2.4860,
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    audioUrl: null,
    markerColor: '#3B82F6',
    markerType: 'pin',
    customMarkerUrl: null,
    optionalFields: [
      { icon: 'footprints', title: 'Distance', subtitle: '1.5 Mile Loop' },
      { icon: 'tree', title: 'Features', subtitle: 'Ancient Woodland' },
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
