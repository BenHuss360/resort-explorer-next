import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type)

    if (!isImage && !isAudio) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: images (jpeg, png, gif, webp) or audio (mp3, wav, m4a, ogg).' },
        { status: 400 }
      )
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp3')
    const filename = `${isImage ? 'images' : 'audio'}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
