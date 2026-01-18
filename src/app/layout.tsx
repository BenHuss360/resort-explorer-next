import type { Metadata, Viewport } from 'next'
import { Nunito, Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ProjectProvider } from '@/components/providers/project-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
  SoftwareApplicationJsonLd,
  FAQJsonLd,
} from '@/components/seo/json-ld'
import './globals.css'

const nunito = Nunito({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'WanderNest - GPS-Powered Guest Exploration for Resorts & Properties',
    template: '%s | WanderNest',
  },
  description:
    'Transform your resort or property with GPS-powered exploration. Guests discover hotspots via interactive maps with proximity-triggered audio, video, and rich content. No app download required.',
  keywords: [
    'GPS exploration platform',
    'resort guest experience',
    'interactive property maps',
    'wellness retreat technology',
    'hospitality navigation',
    'guest engagement platform',
    'proximity-based content',
    'hotel wayfinding',
    'resort digital experience',
    'property tour app',
    'outdoor exploration',
    'location-based storytelling',
    'self-guided tours',
    'hospitality tech',
    'guest journey mapping',
  ],
  authors: [{ name: 'WanderNest', url: 'https://wandernest.co.uk' }],
  creator: 'WanderNest',
  publisher: 'WanderNest',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://wandernest.co.uk'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'WanderNest',
    title: 'WanderNest - GPS-Powered Guest Exploration',
    description:
      'Transform your resort with GPS-powered exploration. Interactive maps with proximity-triggered audio, video, and rich content. No app download required.',
    images: [
      {
        url: '/herobackground.png',
        width: 1920,
        height: 1080,
        alt: 'WanderNest - GPS-Powered Guest Exploration Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WanderNest - GPS-Powered Guest Exploration',
    description:
      'Transform your resort with GPS-powered exploration. Interactive maps with proximity-triggered content. No app required.',
    images: ['/herobackground.png'],
    creator: '@wandernest',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/wnlogo.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2F4F4F',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
        <FAQJsonLd />
      </head>
      <body className={`${nunito.variable} ${inter.variable} antialiased`}>
        <QueryProvider>
          <ProjectProvider>
            {children}
            <Toaster />
          </ProjectProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
