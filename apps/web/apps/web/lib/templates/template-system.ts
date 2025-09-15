'use client'

import { BuilderComponent } from '../store/builder'

export interface WebsiteTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  thumbnail: string
  previewImages: string[]
  components: BuilderComponent[]
  tags: string[]
  isPremium: boolean
  price?: number
  author: {
    id: string
    name: string
    avatar?: string
    verified: boolean
  }
  stats: {
    downloads: number
    rating: number
    reviews: number
  }
  createdAt: Date
  updatedAt: Date
  demoUrl?: string
}

export type TemplateCategory = 
  | 'business'
  | 'portfolio'
  | 'ecommerce'
  | 'blog'
  | 'landing-page'
  | 'agency'
  | 'restaurant'
  | 'real-estate'
  | 'healthcare'
  | 'education'
  | 'nonprofit'
  | 'startup'

export interface TemplateFilter {
  category?: TemplateCategory
  isPremium?: boolean
  priceRange?: { min: number; max: number }
  tags?: string[]
  author?: string
  sortBy?: 'popular' | 'newest' | 'rating' | 'price-low' | 'price-high'
}

// Sample templates
const sampleTemplates: WebsiteTemplate[] = [
  {
    id: 'business-corporate-1',
    name: 'Corporate Business Pro',
    description: 'Professional corporate website template with clean design, perfect for established businesses and enterprises.',
    category: 'business',
    thumbnail: '/templates/business-corporate-1/thumb.jpg',
    previewImages: [
      '/templates/business-corporate-1/preview-1.jpg',
      '/templates/business-corporate-1/preview-2.jpg',
      '/templates/business-corporate-1/preview-3.jpg'
    ],
    components: [
      {
        id: 'navbar-1',
        category: 'NAVBAR',
        name: 'Corporate Navigation',
        position: { x: 0, y: 0 },
        size: { width: '100%', height: 'auto' },
        content: {
          brand: 'CorpBiz',
          links: [
            { text: 'Home', href: '#' },
            { text: 'About', href: '#about' },
            { text: 'Services', href: '#services' },
            { text: 'Contact', href: '#contact' }
          ]
        },
        styles: {
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1rem 0'
        },
        children: [],
        isHidden: false,
        isLocked: false
      },
      {
        id: 'hero-1',
        category: 'HERO',
        name: 'Corporate Hero',
        position: { x: 0, y: 0 },
        size: { width: '100%', height: 'auto' },
        content: {
          title: 'Leading Business Solutions',
          subtitle: 'Transform your business with our innovative strategies and expert consulting services.',
          ctaText: 'Get Started Today'
        },
        styles: {
          backgroundColor: '#1f2937',
          color: '#ffffff',
          padding: '6rem 2rem',
          textAlign: 'center'
        },
        children: [],
        isHidden: false,
        isLocked: false
      }
    ],
    tags: ['professional', 'corporate', 'business', 'clean'],
    isPremium: false,
    author: {
      id: 'builtin',
      name: 'AI Website Builder',
      verified: true
    },
    stats: {
      downloads: 1247,
      rating: 4.8,
      reviews: 89
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'portfolio-creative-1',
    name: 'Creative Portfolio',
    description: 'Stunning portfolio template for designers, photographers, and creative professionals.',
    category: 'portfolio',
    thumbnail: '/templates/portfolio-creative-1/thumb.jpg',
    previewImages: [
      '/templates/portfolio-creative-1/preview-1.jpg',
      '/templates/portfolio-creative-1/preview-2.jpg'
    ],
    components: [
      {
        id: 'hero-2',
        category: 'HERO',
        name: 'Creative Hero',
        position: { x: 0, y: 0 },
        size: { width: '100%', height: 'auto' },
        content: {
          title: 'Creative Designer',
          subtitle: 'Crafting beautiful digital experiences through innovative design.',
          ctaText: 'View Portfolio'
        },
        styles: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          padding: '8rem 2rem',
          textAlign: 'center'
        },
        children: [],
        isHidden: false,
        isLocked: false
      }
    ],
    tags: ['creative', 'portfolio', 'design', 'modern'],
    isPremium: true,
    price: 29,
    author: {
      id: 'design-studio',
      name: 'Design Studio Co.',
      avatar: '/avatars/design-studio.jpg',
      verified: true
    },
    stats: {
      downloads: 892,
      rating: 4.9,
      reviews: 67
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'ecommerce-store-1',
    name: 'Modern Store',
    description: 'Complete e-commerce template with product showcase, shopping cart, and checkout flow.',
    category: 'ecommerce',
    thumbnail: '/templates/ecommerce-store-1/thumb.jpg',
    previewImages: [
      '/templates/ecommerce-store-1/preview-1.jpg',
      '/templates/ecommerce-store-1/preview-2.jpg',
      '/templates/ecommerce-store-1/preview-3.jpg'
    ],
    components: [
      {
        id: 'navbar-ecom',
        category: 'NAVBAR',
        name: 'Store Navigation',
        position: { x: 0, y: 0 },
        size: { width: '100%', height: 'auto' },
        content: {
          brand: 'ModernStore',
          links: [
            { text: 'Products', href: '#products' },
            { text: 'Categories', href: '#categories' },
            { text: 'About', href: '#about' },
            { text: 'Contact', href: '#contact' }
          ]
        },
        styles: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        },
        children: [],
        isHidden: false,
        isLocked: false
      }
    ],
    tags: ['ecommerce', 'shop', 'store', 'product'],
    isPremium: true,
    price: 49,
    author: {
      id: 'ecom-experts',
      name: 'E-commerce Experts',
      verified: true
    },
    stats: {
      downloads: 2156,
      rating: 4.7,
      reviews: 145
    },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'landing-saas-1',
    name: 'SaaS Landing Pro',
    description: 'High-converting SaaS landing page with pricing tables, testimonials, and feature highlights.',
    category: 'landing-page',
    thumbnail: '/templates/landing-saas-1/thumb.jpg',
    previewImages: [
      '/templates/landing-saas-1/preview-1.jpg',
      '/templates/landing-saas-1/preview-2.jpg'
    ],
    components: [
      {
        id: 'hero-saas',
        category: 'HERO',
        name: 'SaaS Hero',
        position: { x: 0, y: 0 },
        size: { width: '100%', height: 'auto' },
        content: {
          title: 'The Ultimate SaaS Solution',
          subtitle: 'Streamline your workflow and boost productivity with our cutting-edge platform.',
          ctaText: 'Start Free Trial'
        },
        styles: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          padding: '6rem 2rem',
          textAlign: 'center'
        },
        children: [],
        isHidden: false,
        isLocked: false
      },
      {
        id: 'pricing-1',
        category: 'PRICING',
        name: 'Pricing Plans',
        position: { x: 0, y: 0 },
        size: { width: '100%', height: 'auto' },
        content: {
          title: 'Starter',
          price: 29,
          features: ['10 Projects', '5GB Storage', 'Basic Support'],
          ctaText: 'Choose Plan'
        },
        styles: {
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '2rem'
        },
        children: [],
        isHidden: false,
        isLocked: false
      }
    ],
    tags: ['saas', 'landing', 'conversion', 'startup'],
    isPremium: true,
    price: 39,
    author: {
      id: 'growth-templates',
      name: 'Growth Templates',
      verified: true
    },
    stats: {
      downloads: 3421,
      rating: 4.9,
      reviews: 234
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: 'restaurant-bistro-1',
    name: 'Bistro Elegance',
    description: 'Elegant restaurant template with menu showcase, reservation system, and gallery.',
    category: 'restaurant',
    thumbnail: '/templates/restaurant-bistro-1/thumb.jpg',
    previewImages: [
      '/templates/restaurant-bistro-1/preview-1.jpg',
      '/templates/restaurant-bistro-1/preview-2.jpg'
    ],
    components: [
      {
        id: 'hero-restaurant',
        category: 'HERO',
        name: 'Restaurant Hero',
        position: { x: 0, y: 0 },
        size: { width: '100%', height: 'auto' },
        content: {
          title: 'Bistro Elegance',
          subtitle: 'Experience culinary excellence in the heart of the city.',
          ctaText: 'Make Reservation'
        },
        styles: {
          backgroundImage: 'url(/images/restaurant-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          padding: '8rem 2rem',
          textAlign: 'center'
        },
        children: [],
        isHidden: false,
        isLocked: false
      }
    ],
    tags: ['restaurant', 'food', 'dining', 'elegant'],
    isPremium: false,
    author: {
      id: 'hospitality-designs',
      name: 'Hospitality Designs',
      verified: true
    },
    stats: {
      downloads: 756,
      rating: 4.6,
      reviews: 42
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
]

class TemplateService {
  private templates: Map<string, WebsiteTemplate> = new Map()
  private userTemplates: Map<string, WebsiteTemplate[]> = new Map() // userId -> templates

  constructor() {
    // Initialize with sample templates
    sampleTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  // Get all templates with optional filtering
  getTemplates(filter: TemplateFilter = {}): WebsiteTemplate[] {
    let templates = Array.from(this.templates.values())

    // Apply filters
    if (filter.category) {
      templates = templates.filter(t => t.category === filter.category)
    }

    if (filter.isPremium !== undefined) {
      templates = templates.filter(t => t.isPremium === filter.isPremium)
    }

    if (filter.priceRange) {
      templates = templates.filter(t => {
        const price = t.price || 0
        return price >= filter.priceRange!.min && price <= filter.priceRange!.max
      })
    }

    if (filter.tags && filter.tags.length > 0) {
      templates = templates.filter(t => 
        filter.tags!.some(tag => t.tags.includes(tag))
      )
    }

    if (filter.author) {
      templates = templates.filter(t => t.author.id === filter.author)
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'popular':
        templates.sort((a, b) => b.stats.downloads - a.stats.downloads)
        break
      case 'newest':
        templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'rating':
        templates.sort((a, b) => b.stats.rating - a.stats.rating)
        break
      case 'price-low':
        templates.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        templates.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      default:
        // Default to popular
        templates.sort((a, b) => b.stats.downloads - a.stats.downloads)
    }

    return templates
  }

  // Get template by ID
  getTemplate(id: string): WebsiteTemplate | null {
    return this.templates.get(id) || null
  }

  // Get templates by category
  getTemplatesByCategory(category: TemplateCategory): WebsiteTemplate[] {
    return this.getTemplates({ category })
  }

  // Get featured/popular templates
  getFeaturedTemplates(limit: number = 6): WebsiteTemplate[] {
    return this.getTemplates({ sortBy: 'popular' }).slice(0, limit)
  }

  // Get free templates
  getFreeTemplates(): WebsiteTemplate[] {
    return this.getTemplates({ isPremium: false })
  }

  // Get premium templates
  getPremiumTemplates(): WebsiteTemplate[] {
    return this.getTemplates({ isPremium: true })
  }

  // Search templates
  searchTemplates(query: string): WebsiteTemplate[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.templates.values()).filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      template.category.toLowerCase().includes(lowerQuery)
    )
  }

  // Get template categories with counts
  getCategories(): Array<{ category: TemplateCategory; count: number; label: string }> {
    const categoryLabels: Record<TemplateCategory, string> = {
      'business': 'Business',
      'portfolio': 'Portfolio',
      'ecommerce': 'E-commerce',
      'blog': 'Blog',
      'landing-page': 'Landing Page',
      'agency': 'Agency',
      'restaurant': 'Restaurant',
      'real-estate': 'Real Estate',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'nonprofit': 'Non-profit',
      'startup': 'Startup'
    }

    const categoryCounts: Record<string, number> = {}
    
    Array.from(this.templates.values()).forEach(template => {
      categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1
    })

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category: category as TemplateCategory,
      count,
      label: categoryLabels[category as TemplateCategory]
    }))
  }

  // Get popular tags
  getPopularTags(limit: number = 20): Array<{ tag: string; count: number }> {
    const tagCounts: Record<string, number> = {}
    
    Array.from(this.templates.values()).forEach(template => {
      template.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))
  }

  // Apply template to project (returns components)
  applyTemplate(templateId: string): BuilderComponent[] | null {
    const template = this.getTemplate(templateId)
    if (!template) return null

    // Deep clone components to avoid mutations
    const clonedComponents = JSON.parse(JSON.stringify(template.components))
    
    // Generate new IDs for components to avoid conflicts
    const generateNewId = (originalId: string) => 
      `${originalId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const updateComponentIds = (components: BuilderComponent[]): BuilderComponent[] => {
      return components.map(component => ({
        ...component,
        id: generateNewId(component.id),
        children: component.children ? updateComponentIds(component.children) : []
      }))
    }

    return updateComponentIds(clonedComponents)
  }

  // Save user template
  saveUserTemplate(userId: string, template: Omit<WebsiteTemplate, 'id' | 'author' | 'stats' | 'createdAt' | 'updatedAt'>): string {
    const templateId = `user_${userId}_${Date.now()}`
    
    const newTemplate: WebsiteTemplate = {
      ...template,
      id: templateId,
      author: {
        id: userId,
        name: 'User', // This would come from user data in a real app
        verified: false
      },
      stats: {
        downloads: 0,
        rating: 0,
        reviews: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.templates.set(templateId, newTemplate)

    // Add to user templates
    if (!this.userTemplates.has(userId)) {
      this.userTemplates.set(userId, [])
    }
    this.userTemplates.get(userId)!.push(newTemplate)

    return templateId
  }

  // Get user templates
  getUserTemplates(userId: string): WebsiteTemplate[] {
    return this.userTemplates.get(userId) || []
  }

  // Update template stats (e.g., when downloaded)
  updateTemplateStats(templateId: string, stats: Partial<WebsiteTemplate['stats']>): boolean {
    const template = this.templates.get(templateId)
    if (!template) return false

    template.stats = { ...template.stats, ...stats }
    template.updatedAt = new Date()
    
    this.templates.set(templateId, template)
    return true
  }

  // Export template for sharing
  exportTemplate(templateId: string): string | null {
    const template = this.getTemplate(templateId)
    if (!template) return null

    // Create exportable version (without internal IDs, stats, etc.)
    const exportableTemplate = {
      name: template.name,
      description: template.description,
      category: template.category,
      components: template.components,
      tags: template.tags,
      thumbnail: template.thumbnail,
      previewImages: template.previewImages
    }

    return JSON.stringify(exportableTemplate, null, 2)
  }

  // Import template from JSON
  importTemplate(templateData: string, userId: string): string | null {
    try {
      const parsedTemplate = JSON.parse(templateData)
      
      // Validate required fields
      if (!parsedTemplate.name || !parsedTemplate.components) {
        throw new Error('Invalid template format')
      }

      const templateId = this.saveUserTemplate(userId, {
        name: parsedTemplate.name,
        description: parsedTemplate.description || '',
        category: parsedTemplate.category || 'business',
        thumbnail: parsedTemplate.thumbnail || '/default-template-thumb.jpg',
        previewImages: parsedTemplate.previewImages || [],
        components: parsedTemplate.components,
        tags: parsedTemplate.tags || [],
        isPremium: false,
        price: undefined
      })

      return templateId
    } catch (error) {
      console.error('Failed to import template:', error)
      return null
    }
  }

  // Get template recommendations based on current components
  getRecommendations(currentComponents: BuilderComponent[], limit: number = 4): WebsiteTemplate[] {
    // Simple recommendation based on component categories
    const currentCategories = new Set(currentComponents.map(c => c.category))
    
    return Array.from(this.templates.values())
      .map(template => ({
        template,
        score: template.components.reduce((score, comp) => 
          currentCategories.has(comp.category) ? score + 1 : score, 0
        )
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ template }) => template)
  }
}

// Singleton instance
export const templateService = new TemplateService()

// Template utilities
export const templateUtils = {
  // Get category color for UI
  getCategoryColor: (category: TemplateCategory): string => {
    const colors: Record<TemplateCategory, string> = {
      'business': 'bg-blue-100 text-blue-800',
      'portfolio': 'bg-purple-100 text-purple-800',
      'ecommerce': 'bg-green-100 text-green-800',
      'blog': 'bg-orange-100 text-orange-800',
      'landing-page': 'bg-red-100 text-red-800',
      'agency': 'bg-indigo-100 text-indigo-800',
      'restaurant': 'bg-yellow-100 text-yellow-800',
      'real-estate': 'bg-teal-100 text-teal-800',
      'healthcare': 'bg-pink-100 text-pink-800',
      'education': 'bg-cyan-100 text-cyan-800',
      'nonprofit': 'bg-lime-100 text-lime-800',
      'startup': 'bg-violet-100 text-violet-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  },

  // Format price for display
  formatPrice: (price?: number): string => {
    return price ? `$${price}` : 'Free'
  },

  // Generate template preview URL
  generatePreviewUrl: (templateId: string): string => {
    return `/templates/${templateId}/preview`
  },

  // Validate template data
  validateTemplate: (template: Partial<WebsiteTemplate>): string[] => {
    const errors: string[] = []
    
    if (!template.name) errors.push('Template name is required')
    if (!template.description) errors.push('Template description is required')
    if (!template.category) errors.push('Template category is required')
    if (!template.components || template.components.length === 0) {
      errors.push('Template must have at least one component')
    }
    
    return errors
  }
}