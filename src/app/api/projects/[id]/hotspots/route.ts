import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hotspots, addTokens } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    // Check if drafts should be included (for portal)
    const includeDrafts = request.nextUrl.searchParams.get('includeDrafts') === 'true'

    const conditions = [
      eq(hotspots.projectId, projectId),
      eq(hotspots.isActive, true),
    ]

    // For guest map, exclude drafts
    if (!includeDrafts) {
      conditions.push(eq(hotspots.isDraft, false))
    }

    const results = await db
      .select()
      .from(hotspots)
      .where(and(...conditions))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching hotspots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    // Check if this is a token-based draft creation (mobile flow)
    let isDraft = false
    let createdVia: 'portal' | 'mobile' = 'portal'

    if (body.token) {
      // Validate token
      const [tokenRecord] = await db
        .select()
        .from(addTokens)
        .where(eq(addTokens.token, body.token))

      if (!tokenRecord) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      if (new Date(tokenRecord.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        )
      }

      if (tokenRecord.projectId !== projectId) {
        return NextResponse.json(
          { error: 'Token does not match project' },
          { status: 403 }
        )
      }

      isDraft = true
      createdVia = 'mobile'
    }

    const [newHotspot] = await db
      .insert(hotspots)
      .values({
        projectId,
        title: body.title,
        description: body.description || 'Draft - pending review',
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        audioUrl: body.audioUrl,
        markerColor: body.markerColor || '#FFD27F',
        markerType: body.markerType || 'pin',
        customMarkerUrl: body.customMarkerUrl,
        optionalFields: body.optionalFields,
        isDraft,
        createdVia,
      })
      .returning()

    return NextResponse.json(newHotspot, { status: 201 })
  } catch (error) {
    console.error('Error creating hotspot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
