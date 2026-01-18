const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wandernest.co.uk'

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WanderNest',
    url: BASE_URL,
    logo: `${BASE_URL}/wnlogo.svg`,
    description:
      'GPS-powered exploration platform for resorts and hospitality properties. Transform guest experiences with interactive maps and proximity-triggered content.',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${BASE_URL}/contact`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'WanderNest',
    applicationCategory: 'TravelApplication',
    applicationSubCategory: 'Guest Experience Platform',
    operatingSystem: 'Web',
    description:
      'GPS-powered exploration platform for resorts and hospitality properties. Guests discover hotspots via interactive maps with proximity-triggered audio, video, and rich content.',
    url: BASE_URL,
    image: `${BASE_URL}/herobackground.png`,
    screenshot: `${BASE_URL}/herobackground.png`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      description: 'Free demo available',
    },
    featureList: [
      'GPS-powered location tracking',
      'Interactive property maps',
      'Proximity-triggered content',
      'Audio and video hotspots',
      'Works offline',
      'No app download required',
      'Privacy-first design',
      'Custom map overlays',
    ],
    provider: {
      '@type': 'Organization',
      name: 'WanderNest',
      url: BASE_URL,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WanderNest',
    url: BASE_URL,
    description:
      'GPS-powered exploration platform for resorts and hospitality properties.',
    publisher: {
      '@type': 'Organization',
      name: 'WanderNest',
      url: BASE_URL,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function FAQJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do guests need to download an app?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, WanderNest works directly in the browser. Guests can access the exploration experience instantly without downloading anything.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does WanderNest work offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, content is cached for offline use. Guests can explore even in remote areas with limited connectivity.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is guest location data private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, location data never leaves the guest\'s device. WanderNest is designed with privacy first.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of content can hotspots include?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hotspots can include audio guides, videos, images, and rich text descriptions that reveal as guests approach.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
