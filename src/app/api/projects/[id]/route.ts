import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Build update object, only including fields that are provided
    const updateData: Record<string, unknown> = {}

    if (body.resortName !== undefined) updateData.resortName = body.resortName
    if (body.homepageContent !== undefined) updateData.homepageContent = body.homepageContent
    if (body.mapExperience !== undefined) updateData.mapExperience = body.mapExperience
    if (body.venueLocationLat !== undefined) updateData.venueLocationLat = body.venueLocationLat
    if (body.venueLocationLng !== undefined) updateData.venueLocationLng = body.venueLocationLng
    // Custom map overlay fields
    if (body.customMapImageUrl !== undefined) updateData.customMapImageUrl = body.customMapImageUrl
    if (body.customMapNorthLat !== undefined) updateData.customMapNorthLat = body.customMapNorthLat
    if (body.customMapSouthLat !== undefined) updateData.customMapSouthLat = body.customMapSouthLat
    if (body.customMapWestLng !== undefined) updateData.customMapWestLng = body.customMapWestLng
    if (body.customMapEastLng !== undefined) updateData.customMapEastLng = body.customMapEastLng
    if (body.customMapOpacity !== undefined) updateData.customMapOpacity = body.customMapOpacity
    if (body.customMapEnabled !== undefined) updateData.customMapEnabled = body.customMapEnabled
    if (body.customMapGCPs !== undefined) updateData.customMapGCPs = body.customMapGCPs
    if (body.customMapCalibrationMode !== undefined) updateData.customMapCalibrationMode = body.customMapCalibrationMode
    // Embed settings
    if (body.embedShowHeader !== undefined) updateData.embedShowHeader = body.embedShowHeader
    if (body.embedShowBranding !== undefined) updateData.embedShowBranding = body.embedShowBranding
    // Brand colors
    if (body.brandPrimaryColor !== undefined) updateData.brandPrimaryColor = body.brandPrimaryColor
    if (body.brandSecondaryColor !== undefined) updateData.brandSecondaryColor = body.brandSecondaryColor
    // Brand fonts
    if (body.brandPrimaryFont !== undefined) updateData.brandPrimaryFont = body.brandPrimaryFont
    if (body.brandSecondaryFont !== undefined) updateData.brandSecondaryFont = body.brandSecondaryFont

    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
