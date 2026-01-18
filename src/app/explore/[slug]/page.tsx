import type { Metadata } from 'next'
import { ExploreClient } from './explore-client'

interface ExplorePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ExplorePageProps): Promise<Metadata> {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wandernest.app'

  try {
    const res = await fetch(`${baseUrl}/api/projects/by-slug/${slug}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return {
        title: 'Explore Map',
        robots: { index: false, follow: false },
      }
    }

    const project = await res.json()

    return {
      title: `${project.resortName} - Interactive Map`,
      description: `Explore ${project.resortName} with our interactive GPS-powered map. Discover points of interest and navigate the property.`,
      openGraph: {
        title: `${project.resortName} - Interactive Map`,
        description: `Explore ${project.resortName} with GPS-powered navigation.`,
        type: 'website',
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  } catch {
    return {
      title: 'Explore Map',
      robots: { index: false, follow: false },
    }
  }
}

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { slug } = await params
  return <ExploreClient slug={slug} />
}
