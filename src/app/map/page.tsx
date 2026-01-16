import { redirect } from 'next/navigation'

// Deprecated: redirect to home to re-enter access code
export default function MapPage() {
  redirect('/')
}
