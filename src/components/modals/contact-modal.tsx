'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send message')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Message sent! We\'ll be in touch soon.')
      setName('')
      setEmail('')
      setMessage('')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ name, email, message })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#2F4F4F]">Get in Touch</DialogTitle>
          <DialogDescription className="text-[#708090]">
            Interested in bringing WanderNest to your property? Send us a message.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#2F4F4F] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#2F4F4F]/20 bg-white text-[#2F4F4F] placeholder:text-[#708090]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD27F] focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2F4F4F] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#2F4F4F]/20 bg-white text-[#2F4F4F] placeholder:text-[#708090]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD27F] focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[#2F4F4F] mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#2F4F4F]/20 bg-white text-[#2F4F4F] placeholder:text-[#708090]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD27F] focus:border-transparent resize-none"
              placeholder="Tell us about your property and what you're looking for..."
            />
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-[#2F4F4F] to-[#3a5f5f] hover:from-[#3a5f5f] hover:to-[#4a6f6f] text-[#F5F0E6] font-semibold"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
