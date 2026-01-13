'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '@/components/providers/project-provider'

export default function PortalSettingsPage() {
  const { project, refreshProject } = useProject()
  const queryClient = useQueryClient()

  const [resortName, setResortName] = useState(project?.resortName || '')
  const [homepageContent, setHomepageContent] = useState(project?.homepageContent || '')
  const [mapExperience, setMapExperience] = useState<string>(project?.mapExperience || 'full')

  const mutation = useMutation({
    mutationFn: async (data: { resortName: string; homepageContent: string; mapExperience: string }) => {
      const res = await fetch(`/api/projects/${project!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json()
    },
    onSuccess: () => {
      refreshProject()
      queryClient.invalidateQueries({ queryKey: ['project'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ resortName, homepageContent, mapExperience })
  }

  const copyAccessCode = () => {
    navigator.clipboard.writeText(project?.accessCode || '')
    alert('Access code copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Access Code */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Access Code</h3>
        <div className="flex items-center gap-4">
          <code className="bg-gray-100 px-4 py-2 rounded-lg text-lg font-mono">
            {project?.accessCode}
          </code>
          <button
            onClick={copyAccessCode}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this code with guests so they can access your resort map.
        </p>
      </div>

      {/* Resort Settings */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Resort Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resort Name
            </label>
            <input
              type="text"
              value={resortName}
              onChange={(e) => setResortName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Message
            </label>
            <textarea
              value={homepageContent}
              onChange={(e) => setHomepageContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Welcome message shown to guests..."
            />
          </div>
        </div>

        {/* Map Experience */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Map Experience</h3>
          <p className="text-sm text-gray-500">
            Choose how guests interact with hotspots on the map.
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mapExperience"
                value="full"
                checked={mapExperience === 'full'}
                onChange={(e) => setMapExperience(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Full Experience</p>
                <p className="text-sm text-gray-500">
                  Guests tap markers to see detailed information with images, audio, and more.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="mapExperience"
                value="interactive"
                checked={mapExperience === 'interactive'}
                onChange={(e) => setMapExperience(e.target.value)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Interactive Mode</p>
                <p className="text-sm text-gray-500">
                  Hotspots automatically open when guests are within 10 meters. Perfect for guided tours.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
          {mutation.isSuccess && (
            <span className="text-green-600 text-sm">Settings saved!</span>
          )}
          {mutation.isError && (
            <span className="text-red-600 text-sm">Error saving settings</span>
          )}
        </div>
      </form>
    </div>
  )
}
