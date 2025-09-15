import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth/config'
import { DatabaseService } from '../../../../lib/db'
import { z } from 'zod'

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isPublic: z.boolean().optional(),
  settings: z.record(z.any()).optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await DatabaseService.getProjectWithDetails(params.id, session.user.id)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    const project = await DatabaseService.updateProject(
      params.id,
      session.user.id,
      validatedData
    )

    // Log activity
    await DatabaseService.logActivity({
      userId: session.user.id,
      type: 'PROJECT_UPDATED',
      description: `Updated project "${project.name}"`,
      metadata: { projectId: project.id, changes: Object.keys(validatedData) }
    })

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Update project error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership before deleting
    const project = await DatabaseService.db.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id // Only owner can delete
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or insufficient permissions' },
        { status: 404 }
      )
    }

    // Delete the project (this will cascade to related records)
    await DatabaseService.db.project.delete({
      where: { id: params.id }
    })

    // Log activity
    await DatabaseService.logActivity({
      userId: session.user.id,
      type: 'PROJECT_DELETED',
      description: `Deleted project "${project.name}"`,
      metadata: { projectId: project.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}