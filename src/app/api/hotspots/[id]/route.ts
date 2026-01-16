import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hotspots } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [hotspot] = await db
    .select()
    .from(hotspots)
    .where(eq(hotspots.id, parseInt(id)))

  if (!hotspot) {
    return NextResponse.json({ error: 'Hotspot not found' }, { status: 404 })
  }

  return NextResponse.json(hotspot)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [{ id }, body] = await Promise.all([params, request.json()])

  // Extract only valid hotspot fields to prevent injection of arbitrary fields
  const updateData: Record<string, unknown> = {}
  const allowedFields = [
    'title', 'description', 'latitude', 'longitude',
    'imageUrl', 'audioUrl', 'markerColor', 'markerType',
    'customMarkerUrl', 'showLabelOnMap', 'optionalFields',
    'isActive', 'isDraft'
  ]

  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field]
    }
  }

  const [updated] = await db
    .update(hotspots)
    .set(updateData)
    .where(eq(hotspots.id, parseInt(id)))
    .returning()

  if (!updated) {
    return NextResponse.json({ error: 'Hotspot not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await db.delete(hotspots).where(eq(hotspots.id, parseInt(id)))

  return NextResponse.json({ success: true })
}
