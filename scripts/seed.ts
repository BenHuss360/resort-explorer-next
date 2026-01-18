import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { projects, hotspots } from '../src/lib/db/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  console.log('Seeding database...')

  // Create a test project - Appletrees, Castle Cary, BA7 7PQ
  const [project] = await db.insert(projects).values({
    resortName: 'Appletrees',
    slug: 'appletrees',
    homepageContent: 'Welcome to Appletrees! Explore our beautiful property in Castle Cary.',
    mapExperience: 'full',
    northBoundary: 51.0968,
    southBoundary: 51.0948,
    eastBoundary: -2.5343,
    westBoundary: -2.5363,
  }).returning()

  console.log('Created project:', project.resortName)

  // Create some test hotspots around Appletrees
  const testHotspots = [
    {
      projectId: project.id,
      title: 'Main House',
      description: 'The main house at Appletrees with stunning views of the Somerset countryside.',
      latitude: 51.0958,
      longitude: -2.5353,
      imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      markerColor: '#3B82F6',
      markerType: 'pin',
      optionalFields: [
        { icon: '🏠', title: 'Accommodation', subtitle: '4 Bedrooms' },
        { icon: '🌳', title: 'Gardens', subtitle: '2 Acres' },
      ],
    },
    {
      projectId: project.id,
      title: 'Orchard',
      description: 'Our beautiful apple orchard with heritage varieties.',
      latitude: 51.0962,
      longitude: -2.5348,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      markerColor: '#10B981',
      markerType: 'circle',
      optionalFields: [
        { icon: '🍎', title: 'Varieties', subtitle: 'Cox, Bramley, Worcester' },
        { icon: '📅', title: 'Harvest', subtitle: 'September-October' },
      ],
    },
    {
      projectId: project.id,
      title: 'Garden Terrace',
      description: 'Relax on the terrace with views across the valley.',
      latitude: 51.0955,
      longitude: -2.5358,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      markerColor: '#8B5CF6',
      markerType: 'star',
      optionalFields: [
        { icon: '☀️', title: 'Best Time', subtitle: 'Afternoon sun' },
        { icon: '🍷', title: 'Features', subtitle: 'BBQ & seating area' },
      ],
    },
  ]

  await db.insert(hotspots).values(testHotspots)
  console.log('Created', testHotspots.length, 'hotspots')

  console.log('Seeding complete!')
}

seed().catch(console.error)
