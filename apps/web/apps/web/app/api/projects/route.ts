import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth/config'
import { DatabaseService } from '../../../lib/db'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Get user's projects with pagination
    const projects = await DatabaseService.db.project.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: { userId: session.user.id }
            }
          }
        ],
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        _count: {
          select: {
            pages: true,
            components: true,
            deployments: true,
            collaborators: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          take: 3
        },
        deployments: {
          where: { status: 'DEPLOYED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            url: true,
            createdAt: true,
            platform: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await DatabaseService.db.project.count({
      where: {
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: { userId: session.user.id }
            }
          }
        ]
      }
    })

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const project = await DatabaseService.createProject({
      ...validatedData,
      userId: session.user.id
    })

    // Log activity
    await DatabaseService.logActivity({
      userId: session.user.id,
      type: 'PROJECT_CREATED',
      description: `Created project "${project.name}"`,
      metadata: { projectId: project.id }
    })

    return NextResponse.json({ project }, { status: 201 })

  } catch (error) {
    console.error('Create project error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}