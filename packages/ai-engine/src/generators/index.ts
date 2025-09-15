import { AIEngine, GenerationResult } from '../index'

/**
 * Component-specific generators with pre-built templates and optimizations
 */
export class ComponentGenerators {
  constructor(private aiEngine: AIEngine) {}

  /**
   * Generate Hero Section Component
   */
  async generateHeroSection(requirements: {
    title?: string
    subtitle?: string
    ctaText?: string
    backgroundType?: 'image' | 'gradient' | 'video'
    layout?: 'center' | 'left' | 'split'
    style?: 'modern' | 'minimal' | 'creative'
  }): Promise<GenerationResult> {
    const prompt = `Create a hero section component with the following specifications:
    - Title: ${requirements.title || 'Dynamic title'}
    - Subtitle: ${requirements.subtitle || 'Engaging subtitle'}
    - CTA Button: ${requirements.ctaText || 'Get Started'}
    - Background: ${requirements.backgroundType || 'gradient'}
    - Layout: ${requirements.layout || 'center'} aligned
    - Style: ${requirements.style || 'modern'} design
    
    The component should be responsive, accessible, and include hover effects.`

    return this.aiEngine.generateComponent(prompt, {
      responsive: true,
      accessible: true,
      props: {
        title: 'string',
        subtitle: 'string',
        ctaText: 'string',
        ctaAction: 'function',
        backgroundImage: 'string?',
        gradient: 'string?'
      }
    })
  }

  /**
   * Generate Navigation Component
   */
  async generateNavigation(requirements: {
    type?: 'horizontal' | 'sidebar' | 'mobile'
    logo?: boolean
    searchBar?: boolean
    userMenu?: boolean
    sticky?: boolean
    transparent?: boolean
  }): Promise<GenerationResult> {
    const prompt = `Create a ${requirements.type || 'horizontal'} navigation component with:
    ${requirements.logo ? '- Company logo on the left' : ''}
    ${requirements.searchBar ? '- Search bar functionality' : ''}
    ${requirements.userMenu ? '- User menu dropdown' : ''}
    ${requirements.sticky ? '- Sticky positioning' : ''}
    ${requirements.transparent ? '- Transparent background option' : ''}
    
    Include mobile responsive behavior and smooth animations.`

    return this.aiEngine.generateComponent(prompt, {
      responsive: true,
      accessible: true,
      props: {
        links: 'array',
        logo: 'string?',
        onSearch: 'function?',
        user: 'object?',
        transparent: 'boolean?',
        sticky: 'boolean?'
      }
    })
  }

  /**
   * Generate Card Component
   */
  async generateCard(requirements: {
    type?: 'basic' | 'product' | 'profile' | 'article' | 'testimonial'
    image?: boolean
    actions?: string[]
    hover?: boolean
    shadow?: 'none' | 'sm' | 'md' | 'lg'
  }): Promise<GenerationResult> {
    const prompt = `Create a ${requirements.type || 'basic'} card component with:
    ${requirements.image ? '- Image display area' : ''}
    ${requirements.actions ? `- Action buttons: ${requirements.actions.join(', ')}` : ''}
    ${requirements.hover ? '- Hover animations and effects' : ''}
    - Shadow level: ${requirements.shadow || 'md'}
    
    Make it flexible and reusable with proper TypeScript props.`

    return this.aiEngine.generateComponent(prompt, {
      responsive: true,
      props: {
        title: 'string',
        description: 'string?',
        image: 'string?',
        imageAlt: 'string?',
        actions: 'array?',
        onClick: 'function?',
        className: 'string?'
      }
    })
  }

  /**
   * Generate Form Component
   */
  async generateForm(requirements: {
    type?: 'contact' | 'signup' | 'login' | 'newsletter' | 'custom'
    fields: Array<{
      name: string
      type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
      label: string
      required?: boolean
      validation?: string
    }>
    submitText?: string
    validation?: boolean
    styling?: 'modern' | 'minimal' | 'bordered'
  }): Promise<GenerationResult> {
    const fieldsDescription = requirements.fields.map(field => 
      `- ${field.label} (${field.type})${field.required ? ' - required' : ''}`
    ).join('\n')

    const prompt = `Create a ${requirements.type || 'custom'} form component with these fields:
    ${fieldsDescription}
    
    Features:
    - Submit button: "${requirements.submitText || 'Submit'}"
    - Style: ${requirements.styling || 'modern'}
    ${requirements.validation ? '- Client-side validation with error messages' : ''}
    - Loading states and success/error handling
    - Responsive design`

    return this.aiEngine.generateComponent(prompt, {
      responsive: true,
      accessible: true,
      props: {
        onSubmit: 'function',
        loading: 'boolean?',
        error: 'string?',
        success: 'boolean?',
        initialValues: 'object?'
      }
    })
  }

  /**
   * Generate Table Component
   */
  async generateTable(requirements: {
    data?: string
    columns: Array<{
      key: string
      label: string
      sortable?: boolean
      filterable?: boolean
      width?: string
    }>
    pagination?: boolean
    search?: boolean
    actions?: string[]
  }): Promise<GenerationResult> {
    const columnsDescription = requirements.columns.map(col => 
      `- ${col.label} (${col.key})${col.sortable ? ' - sortable' : ''}${col.filterable ? ' - filterable' : ''}`
    ).join('\n')

    const prompt = `Create a data table component with these columns:
    ${columnsDescription}
    
    Features:
    ${requirements.pagination ? '- Pagination controls' : ''}
    ${requirements.search ? '- Global search functionality' : ''}
    ${requirements.actions ? `- Row actions: ${requirements.actions.join(', ')}` : ''}
    - Responsive design with mobile optimization
    - Loading states and empty states
    - Proper accessibility with ARIA labels`

    return this.aiEngine.generateComponent(prompt, {
      responsive: true,
      accessible: true,
      props: {
        data: 'array',
        loading: 'boolean?',
        onSort: 'function?',
        onFilter: 'function?',
        onSearch: 'function?',
        onRowAction: 'function?',
        pageSize: 'number?',
        currentPage: 'number?'
      }
    })
  }

  /**
   * Generate Modal/Dialog Component
   */
  async generateModal(requirements: {
    type?: 'basic' | 'confirmation' | 'form' | 'fullscreen'
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closable?: boolean
    backdrop?: boolean
    animation?: 'fade' | 'slide' | 'scale'
  }): Promise<GenerationResult> {
    const prompt = `Create a ${requirements.type || 'basic'} modal component with:
    - Size: ${requirements.size || 'md'}
    ${requirements.closable !== false ? '- Close button and ESC key support' : ''}
    ${requirements.backdrop !== false ? '- Backdrop overlay' : ''}
    - Animation: ${requirements.animation || 'fade'} effect
    - Focus management and accessibility
    - Portal rendering outside DOM tree
    - Scroll lock when open`

    return this.aiEngine.generateComponent(prompt, {
      accessible: true,
      props: {
        isOpen: 'boolean',
        onClose: 'function',
        title: 'string?',
        children: 'ReactNode',
        size: 'string?',
        closable: 'boolean?'
      }
    })
  }

  /**
   * Generate Dashboard Layout
   */
  async generateDashboard(requirements: {
    sidebar?: boolean
    topbar?: boolean
    breadcrumbs?: boolean
    widgets?: string[]
    theme?: 'light' | 'dark' | 'auto'
  }): Promise<GenerationResult> {
    const prompt = `Create a dashboard layout component with:
    ${requirements.sidebar ? '- Collapsible sidebar navigation' : ''}
    ${requirements.topbar ? '- Top navigation bar' : ''}
    ${requirements.breadcrumbs ? '- Breadcrumb navigation' : ''}
    ${requirements.widgets ? `- Widget areas for: ${requirements.widgets.join(', ')}` : ''}
    - Theme support: ${requirements.theme || 'light'}
    - Responsive design for mobile/tablet
    - Grid system for content organization`

    return this.aiEngine.generateComponent(prompt, {
      responsive: true,
      props: {
        sidebarOpen: 'boolean?',
        onSidebarToggle: 'function?',
        user: 'object?',
        breadcrumbs: 'array?',
        children: 'ReactNode'
      }
    })
  }

  /**
   * Generate Charts/Visualization Component
   */
  async generateChart(requirements: {
    type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'donut'
    responsive?: boolean
    interactive?: boolean
    animations?: boolean
    legend?: boolean
    tooltip?: boolean
  }): Promise<GenerationResult> {
    const prompt = `Create a ${requirements.type} chart component using a popular charting library (Chart.js, Recharts, or D3):
    ${requirements.responsive !== false ? '- Fully responsive design' : ''}
    ${requirements.interactive ? '- Interactive elements (hover, click, zoom)' : ''}
    ${requirements.animations !== false ? '- Smooth animations' : ''}
    ${requirements.legend ? '- Legend display' : ''}
    ${requirements.tooltip !== false ? '- Tooltip on hover' : ''}
    - Accessible with proper ARIA labels
    - Customizable colors and styling
    - Loading and error states`

    return this.aiEngine.generateComponent(prompt, {
      responsive: true,
      accessible: true,
      props: {
        data: 'array',
        width: 'number?',
        height: 'number?',
        colors: 'array?',
        loading: 'boolean?',
        error: 'string?',
        onDataPointClick: 'function?'
      }
    })
  }
}

/**
 * Page-specific generators
 */
export class PageGenerators {
  constructor(private aiEngine: AIEngine) {}

  /**
   * Generate Landing Page
   */
  async generateLandingPage(requirements: {
    industry?: string
    sections?: string[]
    cta?: string
    style?: 'modern' | 'minimal' | 'creative'
    colorScheme?: string
  }): Promise<GenerationResult> {
    const sectionsText = requirements.sections?.join(', ') || 'hero, features, testimonials, pricing, contact'
    
    const prompt = `Create a complete ${requirements.industry || 'SaaS'} landing page with these sections: ${sectionsText}
    
    - Style: ${requirements.style || 'modern'}
    - Color scheme: ${requirements.colorScheme || 'blue and white'}
    - Main CTA: "${requirements.cta || 'Get Started'}"
    - Include proper SEO meta tags
    - Responsive design
    - Optimized for conversions
    - Smooth scrolling between sections`

    return this.aiEngine.generatePage(prompt, {
      seo: true,
      responsive: true,
      components: requirements.sections || ['hero', 'features', 'testimonials', 'pricing', 'contact']
    })
  }

  /**
   * Generate Dashboard Page
   */
  async generateDashboardPage(requirements: {
    type?: 'analytics' | 'admin' | 'user' | 'ecommerce'
    widgets?: string[]
    layout?: 'grid' | 'sidebar' | 'tabs'
  }): Promise<GenerationResult> {
    const prompt = `Create a ${requirements.type || 'analytics'} dashboard page with:
    - Layout: ${requirements.layout || 'grid'}
    - Widgets: ${requirements.widgets?.join(', ') || 'stats, charts, recent activity, notifications'}
    - Real-time data updates
    - Responsive grid layout
    - Dark/light theme support
    - Export functionality`

    return this.aiEngine.generatePage(prompt, {
      responsive: true,
      components: ['sidebar', 'topbar', 'widgets', 'charts']
    })
  }

  /**
   * Generate E-commerce Product Page
   */
  async generateProductPage(requirements: {
    productType?: string
    features?: string[]
    gallery?: boolean
    reviews?: boolean
    recommendations?: boolean
  }): Promise<GenerationResult> {
    const prompt = `Create an e-commerce product page for ${requirements.productType || 'general products'} with:
    ${requirements.gallery !== false ? '- Image gallery with zoom functionality' : ''}
    - Product details and specifications
    - Add to cart functionality
    - Price display with discounts
    ${requirements.reviews ? '- Customer reviews section' : ''}
    ${requirements.recommendations ? '- Related products' : ''}
    - Mobile-optimized layout
    - Breadcrumb navigation`

    return this.aiEngine.generatePage(prompt, {
      responsive: true,
      seo: true,
      components: ['gallery', 'details', 'cart', 'reviews', 'recommendations']
    })
  }
}

/**
 * API generators
 */
export class APIGenerators {
  constructor(private aiEngine: AIEngine) {}

  /**
   * Generate REST API endpoints
   */
  async generateRESTAPI(requirements: {
    resource: string
    operations?: ('GET' | 'POST' | 'PUT' | 'DELETE')[]
    authentication?: boolean
    validation?: boolean
    database?: 'postgresql' | 'mongodb' | 'mysql'
    relationships?: string[]
  }): Promise<GenerationResult> {
    const ops = requirements.operations || ['GET', 'POST', 'PUT', 'DELETE']
    
    const prompt = `Create REST API endpoints for ${requirements.resource} resource with:
    - Operations: ${ops.join(', ')}
    ${requirements.authentication ? '- JWT authentication middleware' : ''}
    ${requirements.validation ? '- Request validation using Zod or Joi' : ''}
    - Database: ${requirements.database || 'PostgreSQL'} with Prisma
    ${requirements.relationships ? `- Relationships with: ${requirements.relationships.join(', ')}` : ''}
    - Error handling and status codes
    - Rate limiting
    - OpenAPI/Swagger documentation`

    return this.aiEngine.generateAPI(prompt, {
      authentication: requirements.authentication,
      validation: requirements.validation,
      database: requirements.database
    })
  }

  /**
   * Generate GraphQL Schema and Resolvers
   */
  async generateGraphQLAPI(requirements: {
    entities: string[]
    mutations?: string[]
    subscriptions?: boolean
    authentication?: boolean
  }): Promise<GenerationResult> {
    const prompt = `Create GraphQL schema and resolvers for entities: ${requirements.entities.join(', ')}
    ${requirements.mutations ? `- Mutations: ${requirements.mutations.join(', ')}` : ''}
    ${requirements.subscriptions ? '- Real-time subscriptions' : ''}
    ${requirements.authentication ? '- Authentication and authorization' : ''}
    - Proper error handling
    - Pagination support
    - Field-level security
    - Query complexity analysis`

    return this.aiEngine.generateAPI(prompt, {
      authentication: requirements.authentication
    })
  }
}

