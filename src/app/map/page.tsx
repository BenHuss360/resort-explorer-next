import type { Metadata } from 'next'
import { MapContainer } from '@/components/map/map-container'

export const metadata: Metadata = {
  title: 'Explore Map',
  description:
    'Discover points of interest with our GPS-powered interactive map. Navigate your resort or property with real-time location tracking and proximity-triggered content.',
  openGraph: {
    title: 'Explore Map | Wandernest',
    description:
      'Discover points of interest with our GPS-powered interactive map.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function MapPage() {
  return <MapContainer />
}
