import type { Metadata } from 'next'
import { EmbedClient } from './embed-client'

interface EmbedPageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({
  params,
}: EmbedPageProps): Promise<Metadata> {
  const { code } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wandernest.app'

  try {
    const res = await fetch(`${baseUrl}/api/projects/by-code/${code}`, {
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

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { code } = await params
  return <EmbedClient code={code} />
}
