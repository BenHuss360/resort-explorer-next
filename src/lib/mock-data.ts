import type { Hotspot } from '@/lib/db/schema'
import type { ProjectContextData } from '@/components/providers/project-provider'

// Demo project for creator mode - uses The Newt in Somerset as a real-world example
export const DEMO_PROJECT: ProjectContextData = {
  id: 999999,
  resortName: 'The Newt in Somerset',
  accessCode: 'DEMO',
  homepageContent: 'Welcome to The Newt in Somerset! Explore our working country estate with beautiful gardens, farm experiences, and exceptional dining. Discover all our hotspots on the interactive map.',
  mapExperience: 'full',
  boundaries: {
    north: 51.1150,
    south: 51.1000,
    east: -2.4650,
    west: -2.4950,
  },
  customMapOverlay: {
    imageUrl: '/assets/custommap.webp',
    northLat: 51.1150,
    southLat: 51.1000,
    westLng: -2.4950,
    eastLng: -2.4650,
    opacity: 0.9,
    enabled: true,
    gcps: [
      {
        id: 'gcp-topleft',
        imageX: 0,
        imageY: 0,
        latitude: 51.1150,
        longitude: -2.4950,
        label: 'Top-Left',
      },
      {
        id: 'gcp-bottomright',
        imageX: 1,
        imageY: 1,
        latitude: 51.1000,
        longitude: -2.4650,
        label: 'Bottom-Right',
      },
    ],
    calibrationMode: '2corners',
  },
  venueLocation: {
    latitude: 51.1089,
    longitude: -2.4789,
  },
  embedSettings: {
    showHeader: true,
    showBranding: true,
  },
}

// Sample hotspots for demo mode - based on The Newt in Somerset attractions
export const DEMO_HOTSPOTS: Hotspot[] = [
  {
    id: 999001,
    projectId: 999999,
    title: 'The Walled Garden',
    description: 'Explore our magnificent Victorian walled garden, restored to its former glory. Discover heritage apple varieties, espaliered fruit trees, and vibrant seasonal plantings across colour-themed rooms.',
    latitude: 51.1095,
    longitude: -2.4775,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    audioUrl: null,
    markerColor: '#059669',
    markerType: 'pin',
    customMarkerUrl: null,
    showLabelOnMap: false,
    optionalFields: [
      { icon: '🍃', title: 'Highlight', subtitle: '265 Apple Varieties' },
      { icon: '⏰', title: 'Best Time', subtitle: 'Spring & Autumn' },
    ],
    isActive: true,
    isDraft: false,
    createdVia: 'portal',
    createdAt: new Date(),
  },
  {
    id: 999002,
    projectId: 999999,
    title: 'The Parabola',
    description: 'A sweeping curved orchard featuring over 460 apple trees arranged in an elegant parabolic shape. Walk through rows of heritage cider apples and take in the stunning Somerset countryside views.',
    latitude: 51.1080,
    longitude: -2.4800,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    audioUrl: null,
    markerColor: '#DC2626',
    markerType: 'circle',
    customMarkerUrl: null,
    showLabelOnMap: false,
    optionalFields: [
      { icon: '🍎', title: 'Trees', subtitle: '460+ Heritage Apples' },
      { icon: '🗺️', title: 'Feature', subtitle: 'Panoramic Views' },
    ],
    isActive: true,
    isDraft: false,
    createdVia: 'portal',
    createdAt: new Date(),
  },
  {
    id: 999003,
    projectId: 999999,
    title: 'The Farmyard',
    description: 'Meet our friendly farm animals including rare breed pigs, sheep, chickens, and goats. Perfect for families, the farmyard brings traditional farming to life with daily feeding times and interactive experiences.',
    latitude: 51.1070,
    longitude: -2.4820,
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
    audioUrl: null,
    markerColor: '#F59E0B',
    markerType: 'star',
    customMarkerUrl: null,
    showLabelOnMap: false,
    optionalFields: [
      { icon: '❤️', title: 'Family', subtitle: 'Kid Friendly' },
      { icon: '⏰', title: 'Feeding', subtitle: '11 AM & 3 PM' },
    ],
    isActive: true,
    isDraft: false,
    createdVia: 'portal',
    createdAt: new Date(),
  },
  {
    id: 999004,
    projectId: 999999,
    title: 'The Cyder Press',
    description: 'Our working cyder press and tasting room. Sample award-winning cyders made from estate-grown apples, learn about traditional cyder-making, and browse our farm shop for local Somerset produce.',
    latitude: 51.1100,
    longitude: -2.4760,
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
    audioUrl: null,
    markerColor: '#8B5CF6',
    markerType: 'diamond',
    customMarkerUrl: null,
    showLabelOnMap: false,
    optionalFields: [
      { icon: '🍷', title: 'Tastings', subtitle: 'Daily from 10 AM' },
      { icon: '🛍️', title: 'Shop', subtitle: 'Local Produce' },
    ],
    isActive: true,
    isDraft: false,
    createdVia: 'portal',
    createdAt: new Date(),
  },
  {
    id: 999005,
    projectId: 999999,
    title: 'The Woodland Walk',
    description: 'Meander through ancient woodland along peaceful trails. Discover hidden sculptures, wildlife habitats, and the tranquil Mushroom Log where shiitake and oyster mushrooms are cultivated.',
    latitude: 51.1105,
    longitude: -2.4810,
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    audioUrl: null,
    markerColor: '#3B82F6',
    markerType: 'pin',
    customMarkerUrl: null,
    showLabelOnMap: false,
    optionalFields: [
      { icon: '🥾', title: 'Distance', subtitle: '1.5 Mile Loop' },
      { icon: '🌳', title: 'Features', subtitle: 'Ancient Woodland' },
    ],
    isActive: true,
    isDraft: false,
    createdVia: 'portal',
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
