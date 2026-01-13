import { redirect } from 'next/navigation'

export default function Home() {
  // For now, redirect to map page (skip login during development)
  redirect('/map')
}
