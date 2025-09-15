import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth/config'
import { DatabaseService } from '../../../../../lib/db'
import { z } from 'zod'

const createComponentSchema = z.object({
  pageId: z.string().optional(),
  parentId: z.string().optional(),
  name: z.string().min(1).max(100),
  type: z.string(),
  category: z.string(),
  props: z.record(z.any()).optional().default({}),
  styles: z.record(z.any()).optional().default({}),
  position: z.record(z.any()).optional().default({})
})

const updateComponentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  props: z.record(z.any()).optional(),
  styles: z.record(z.any()).optional(),
  position: z.record(z.any()).optional(),
  isLocked: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  order: z.number().optional()
})

const reorderComponentsSchema = z.object({
  components: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
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

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    // Verify project access
    const project = await DatabaseService.getProjectWithDetails(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const components = await DatabaseService.db.componentInstance.findMany({
      where: {
        projectId: params.id,
        ...(pageId ? { pageId } : { pageId: null })
      },
      include: {
        children: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ components })

  } catch (error) {
    console.error('Get components error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project access
    const project = await DatabaseService.getProjectWithDetails(params.id, session.user.id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createComponentSchema.parse(body)

    const component = await DatabaseService.createComponent({
      ...validatedData,
      projectId: params.id
    })

    // Log activity
    await DatabaseService.logActivity({
      userId: session.user.id,
      type: 'COMPONENT_ADDED',
      description: `Added ${validatedData.category} component "${validatedData.name}"`,
      metadata: { 
        projectId: params.id,
        componentId: component.id,
        componentType: validatedData.category
      }
    })

    return NextResponse.json({ component }, { status: 201 })

  } catch (error) {
    console.error('Create component error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create component' },
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

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'reorder') {
      const body = await request.json()
      const { components } = reorderComponentsSchema.parse(body)
      
      await DatabaseService.reorderComponents(components)
      
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Bulk component operation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}