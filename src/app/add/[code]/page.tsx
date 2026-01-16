import { Metadata } from 'next'
import { AddHotspotClient } from './add-hotspot-client'

export const metadata: Metadata = {
  title: 'Add Hotspot',
  description: 'Add a new hotspot to the map',
  robots: { index: false },
}

export default async function AddHotspotPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { code } = await params
  const { token } = await searchParams

  return <AddHotspotClient code={code} token={token} />
}
