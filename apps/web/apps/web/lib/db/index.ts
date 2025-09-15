import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prisma = global.cachedPrisma
}

export const db = prisma

// Database utility functions
export class DatabaseService {
  // User operations
  static async createUser(data: {
    email: string
    name?: string
    image?: string
  }) {
    return await db.user.create({
      data: {
        ...data,
        profile: {
          create: {
            preferences: {},
            onboardingStep: 0
          }
        }
      },
      include: {
        profile: true
      }
    })
  }

  static async getUserWithProfile(userId: string) {
    return await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscription: true,
        projects: {
          include: {
            _count: {
              select: {
                pages: true,
                components: true,
                deployments: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 10
        }
      }
    })
  }

  // Project operations
  static async createProject(data: {
    name: string
    description?: string
    userId: string
  }) {
    const slug = data.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return await db.project.create({
      data: {
        ...data,
        slug: `${slug}-${Date.now()}`,
        pages: {
          create: {
            name: 'Home',
            slug: 'home',
            path: '/',
            title: data.name,
            isHomePage: true
          }
        },
        analytics: {
          create: {}
        }
      },
      include: {
        pages: true,
        analytics: true,
        _count: {
          select: {
            components: true,
            deployments: true
          }
        }
      }
    })
  }

  static async getProjectWithDetails(projectId: string, userId: string) {
    return await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: userId },
          {
            collaborators: {
              some: { userId: userId }
            }
          }
        ]
      },
      include: {
        pages: {
          include: {
            components: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        components: {
          where: { pageId: null },
          orderBy: { order: 'asc' }
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
          }
        },
        assets: {
          orderBy: { createdAt: 'desc' }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        analytics: true
      }
    })
  }

  static async updateProject(projectId: string, userId: string, data: any) {
    // Verify user has permission to update
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: userId },
          {
            collaborators: {
              some: {
                userId: userId,
                role: { in: ['OWNER', 'ADMIN', 'EDITOR'] }
              }
            }
          }
        ]
      }
    })

    if (!project) {
      throw new Error('Project not found or insufficient permissions')
    }

    return await db.project.update({
      where: { id: projectId },
      data
    })
  }

  // Component operations
  static async createComponent(data: {
    projectId: string
    pageId?: string
    parentId?: string
    name: string
    type: string
    category: string
    props?: any
    styles?: any
    position?: any
  }) {
    // Get the next order value
    const lastComponent = await db.componentInstance.findFirst({
      where: {
        projectId: data.projectId,
        pageId: data.pageId,
        parentId: data.parentId
      },
      orderBy: { order: 'desc' }
    })

    return await db.componentInstance.create({
      data: {
        ...data,
        props: data.props || {},
        styles: data.styles || {},
        position: data.position || {},
        order: (lastComponent?.order || 0) + 1
      }
    })
  }

  static async updateComponent(componentId: string, data: any) {
    return await db.componentInstance.update({
      where: { id: componentId },
      data
    })
  }

  static async deleteComponent(componentId: string) {
    // This will cascade to children due to the relation
    return await db.componentInstance.delete({
      where: { id: componentId }
    })
  }

  static async reorderComponents(updates: Array<{ id: string; order: number }>) {
    const updatePromises = updates.map(({ id, order }) =>
      db.componentInstance.update({
        where: { id },
        data: { order }
      })
    )

    return await db.$transaction(updatePromises)
  }

  // Version control operations
  static async createVersion(data: {
    projectId: string
    version: string
    name?: string
    description?: string
    data: any
  }) {
    return await db.projectVersion.create({
      data
    })
  }

  static async getVersions(projectId: string) {
    return await db.projectVersion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Deployment operations
  static async createDeployment(data: {
    projectId: string
    platform: string
    versionId?: string
  }) {
    return await db.deployment.create({
      data: {
        ...data,
        platform: data.platform as any,
        status: 'PENDING'
      }
    })
  }

  static async updateDeployment(deploymentId: string, data: any) {
    return await db.deployment.update({
      where: { id: deploymentId },
      data
    })
  }

  // AI usage tracking
  static async trackAIUsage(data: {
    userId: string
    type: string
    model?: string
    tokensUsed?: number
    cost?: number
    requestData?: any
    responseData?: any
    processingTimeMs?: number
  }) {
    return await db.aIUsage.create({
      data: {
        ...data,
        type: data.type as any,
        tokensUsed: data.tokensUsed || 0,
        cost: data.cost || 0.0
      }
    })
  }

  // Analytics
  static async updateProjectAnalytics(projectId: string, data: {
    pageViews?: number
    uniqueUsers?: number
    deployments?: number
  }) {
    return await db.projectAnalytics.upsert({
      where: { projectId },
      update: {
        ...data,
        lastVisited: new Date()
      },
      create: {
        projectId,
        ...data,
        lastVisited: new Date()
      }
    })
  }

  // Collaboration
  static async inviteCollaborator(data: {
    projectId: string
    email: string
    role: string
  }) {
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    
    return await db.projectInvitation.create({
      data: {
        ...data,
        role: data.role as any,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })
  }

  static async acceptInvitation(token: string, userId: string) {
    const invitation = await db.projectInvitation.findUnique({
      where: { token },
      include: { project: true }
    })

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new Error('Invalid or expired invitation')
    }

    // Create collaborator
    await db.projectCollaborator.create({
      data: {
        projectId: invitation.projectId,
        userId,
        role: invitation.role
      }
    })

    // Delete invitation
    await db.projectInvitation.delete({
      where: { token }
    })

    return invitation.project
  }

  // Activity logging
  static async logActivity(data: {
    userId: string
    type: string
    description: string
    metadata?: any
  }) {
    return await db.userActivity.create({
      data: {
        ...data,
        type: data.type as any,
        metadata: data.metadata || {}
      }
    })
  }

  // Asset management
  static async createAsset(data: {
    projectId: string
    name: string
    url: string
    type: string
    size?: number
    mimeType?: string
    alt?: string
    metadata?: any
  }) {
    return await db.asset.create({
      data: {
        ...data,
        type: data.type as any,
        metadata: data.metadata || {}
      }
    })
  }

  static async getAssets(projectId: string) {
    return await db.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async deleteAsset(assetId: string) {
    return await db.asset.delete({
      where: { id: assetId }
    })
  }
}

export default db