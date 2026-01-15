export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wandernest.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Wandernest',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    description:
      'GPS-powered exploration platform for wellness retreats, resorts, and luxury properties. Interactive maps with proximity-triggered content.',
    url: baseUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Wandernest',
      url: baseUrl,
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wandernest.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wandernest',
    url: baseUrl,
    description:
      'GPS-powered exploration platform for wellness retreats, resorts, and luxury properties.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?code={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
