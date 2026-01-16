import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { addTokens, projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Look up token with project details
    const [tokenRecord] = await db
      .select({
        id: addTokens.id,
        projectId: addTokens.projectId,
        expiresAt: addTokens.expiresAt,
        projectName: projects.resortName,
        accessCode: projects.accessCode,
      })
      .from(addTokens)
      .innerJoin(projects, eq(addTokens.projectId, projects.id))
      .where(eq(addTokens.token, token))

    if (!tokenRecord) {
      return NextResponse.json(
        { valid: false, error: 'Token not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(tokenRecord.expiresAt) < new Date()) {
      // Delete expired token
      await db.delete(addTokens).where(eq(addTokens.token, token))

      return NextResponse.json(
        { valid: false, error: 'Token expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      valid: true,
      projectId: tokenRecord.projectId,
      projectName: tokenRecord.projectName,
      accessCode: tokenRecord.accessCode,
      expiresAt: tokenRecord.expiresAt,
    })
  } catch (error) {
    console.error('Error validating token:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Revoke a token
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const result = await db
      .delete(addTokens)
      .where(eq(addTokens.token, token))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
