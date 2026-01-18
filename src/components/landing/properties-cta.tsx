'use client'

import { useRouter } from 'next/navigation'
import { Play, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { activateDemoMode, DEMO_PROJECT } from '@/lib/mock-data'
import { useProject } from '@/components/providers/project-provider'
import { toast } from 'sonner'

export function PropertiesCTA() {
  const router = useRouter()
  const { setProject } = useProject()

  const handleTryDemo = () => {
    activateDemoMode()
    setProject(DEMO_PROJECT)
    toast.success('Welcome to Demo Mode!')
    router.push('/portal/preview')
  }

  return (
    <section id="for-properties" className="py-20 md:py-28 px-4 bg-gradient-to-b from-[#F5F0E6] to-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="mx-auto mb-6">
          <img src="/wnlogo.svg" alt="WanderNest" className="h-16 w-auto mx-auto" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2F4F4F] mb-4">
          Bring WanderNest to{' '}
          <span className="bg-gradient-to-r from-[#2F4F4F] to-[#3a5f5f] bg-clip-text text-transparent">
            Your Property
          </span>
        </h2>

        {/* Description */}
        <p className="text-lg text-[#708090] max-w-2xl mx-auto mb-8 leading-relaxed">
          Transform how guests experience your resort, retreat, or hospitality property.
          GPS-powered exploration that works instantly — no app download required.
        </p>

        {/* Value props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
          {[
            { label: 'Easy Setup', desc: 'Upload your map, add hotspots' },
            { label: 'No App Required', desc: 'Works in any browser' },
            { label: 'Embed Anywhere', desc: 'QR codes, links, or iframe' },
          ].map((item, i) => (
            <div key={i} className="text-center p-4">
              <div className="w-2 h-2 bg-[#FFD27F] rounded-full mx-auto mb-3" />
              <h4 className="font-semibold text-[#2F4F4F] mb-1">{item.label}</h4>
              <p className="text-sm text-[#708090]">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleTryDemo}
            size="lg"
            className="bg-gradient-to-r from-[#2F4F4F] to-[#3a5f5f] hover:from-[#3a5f5f] hover:to-[#4a6f6f] text-[#F5F0E6] font-semibold shadow-lg shadow-[#FFD27F]/25 px-8"
          >
            <Play className="w-4 h-4 mr-2" />
            Try the Demo
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-[#2F4F4F]/20 text-[#2F4F4F] hover:bg-[#2F4F4F] hover:text-[#F5F0E6] px-8"
          >
            Contact Us
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
