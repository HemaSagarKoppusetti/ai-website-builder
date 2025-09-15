import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Re-export Prisma types and client
export * from '@prisma/client'
export { db as prisma }

// Utility types
export type CreateProject = {
  name: string
  description?: string
  type?: 'WEBSITE' | 'LANDING_PAGE' | 'BLOG' | 'ECOMMERCE' | 'PORTFOLIO' | 'DASHBOARD' | 'DOCUMENTATION'
  userId: string
}

export type CreateComponent = {
  name: string
  type: 'LAYOUT' | 'UI' | 'NAVIGATION' | 'FORM' | 'DATA_DISPLAY' | 'MEDIA' | 'CONTENT' | 'CUSTOM'
  category: 'HERO' | 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'NAVBAR' | 'BUTTON' | 'CARD' | 'MODAL' | 'FORM' | 'TABLE' | 'CHART' | 'IMAGE' | 'VIDEO' | 'TEXT' | 'LIST' | 'GRID' | 'CONTAINER'
  props?: Record<string, any>
  styles?: Record<string, any>
  projectId?: string
  createdById?: string
}

export type CreatePage = {
  title: string
  slug: string
  path?: string
  content?: any[]
  projectId: string
}

// Database utilities
export const dbUtils = {
  // User utilities
  async getUserWithProjects(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            _count: {
              select: {
                pages: true,
                components: true,
                deployments: true
              }
            }
          }
        }
      }
    })
  },

  // Project utilities
  async getProjectWithDetails(projectId: string) {
    return db.project.findUnique({
      where: { id: projectId },
      include: {
        pages: true,
        components: true,
        assets: {
          take: 10 // Limit assets to first 10
        },
        deployments: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        collaborations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    })
  },

  // Component utilities
  async getPublicComponents(category?: string) {
    return db.component.findMany({
      where: {
        isPublic: true,
        ...(category && { category: category as any })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        usageCount: 'desc'
      }
    })
  },

  // Template utilities
  async getFeaturedTemplates() {
    return db.template.findMany({
      where: {
        isPublished: true,
        isApproved: true,
        isFeatured: true
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        downloadCount: 'desc'
      },
      take: 12
    })
  },

  // Deployment utilities
  async getLatestDeployment(projectId: string) {
    return db.deployment.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        deployedBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })
  },

  // Analytics utilities
  async trackEvent(event: string, userId?: string, projectId?: string, properties?: Record<string, any>) {
    return db.analytics.create({
      data: {
        event,
        userId,
        projectId,
        properties: properties || {},
        timestamp: new Date()
      }
    })
  }
}