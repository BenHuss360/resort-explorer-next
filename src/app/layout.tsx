import type { Metadata, Viewport } from 'next'
import { Nunito, Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ProjectProvider } from '@/components/providers/project-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/json-ld'
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
    default: 'Wandernest - GPS-Powered Guest Exploration',
    template: '%s | Wandernest',
  },
  description:
    'GPS-powered exploration platform for wellness retreats, resorts, and luxury properties. Let your guests discover points of interest with interactive maps and proximity-triggered content.',
  keywords: [
    'GPS exploration',
    'resort guest experience',
    'interactive property maps',
    'wellness retreat technology',
    'hospitality navigation',
    'guest engagement platform',
    'proximity-based content',
    'property points of interest',
  ],
  authors: [{ name: 'Wandernest' }],
  creator: 'Wandernest',
  publisher: 'Wandernest',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://wandernest.app'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Wandernest',
    title: 'Wandernest - GPS-Powered Guest Exploration',
    description:
      'GPS-powered exploration platform for wellness retreats, resorts, and luxury properties. Interactive maps with proximity-triggered content.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Wandernest - GPS-Powered Guest Exploration Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wandernest - GPS-Powered Guest Exploration',
    description:
      'GPS-powered exploration for wellness retreats and luxury properties. Interactive maps with proximity-triggered content.',
    images: ['/og-image.png'],
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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
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
