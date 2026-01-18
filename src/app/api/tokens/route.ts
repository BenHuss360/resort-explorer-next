import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { addTokens, projects } from '@/lib/db/schema'
import { eq, and, lt } from 'drizzle-orm'
import crypto from 'crypto'

// Clean up expired tokens for this project
async function cleanupExpiredTokens(projectId: number) {
  await db
    .delete(addTokens)
    .where(and(
      eq(addTokens.projectId, projectId),
      lt(addTokens.expiresAt, new Date())
    ))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, expiresInHours = 24 } = body

    if (!projectId || typeof projectId !== 'number') {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate expiry (1 hour to 1 week)
    const hours = Math.min(Math.max(expiresInHours, 1), 168)

    // Verify project exists
    const [project] = await db
      .select({ id: projects.id, slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, projectId))

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Clean up expired tokens
    await cleanupExpiredTokens(projectId)

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)

    // Create token record
    const [newToken] = await db
      .insert(addTokens)
      .values({
        projectId,
        token,
        expiresAt,
      })
      .returning()

    // Build the QR URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const qrUrl = `${baseUrl}/add/${project.slug}?token=${token}`

    return NextResponse.json({
      token: newToken.token,
      expiresAt: newToken.expiresAt,
      qrUrl,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: List active tokens for a project
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const id = parseInt(projectId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    // Clean up expired tokens first
    await cleanupExpiredTokens(id)

    // Get active tokens
    const tokens = await db
      .select()
      .from(addTokens)
      .where(eq(addTokens.projectId, id))

    return NextResponse.json(tokens)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
