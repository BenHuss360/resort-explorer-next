import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hotspots } from '@/lib/db/schema'
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

    const results = await db
      .select()
      .from(hotspots)
      .where(and(
        eq(hotspots.projectId, projectId),
        eq(hotspots.isActive, true)
      ))

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
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const [newHotspot] = await db
      .insert(hotspots)
      .values({
        projectId,
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        audioUrl: body.audioUrl,
        markerColor: body.markerColor,
        markerType: body.markerType,
        customMarkerUrl: body.customMarkerUrl,
        optionalFields: body.optionalFields,
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
