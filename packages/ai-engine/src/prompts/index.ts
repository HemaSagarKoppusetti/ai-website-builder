/**
 * Prompt templates and engineering utilities for AI code generation
 */

export interface PromptTemplate {
  name: string
  description: string
  template: string
  variables: string[]
  examples?: Array<{
    input: Record<string, string>
    output: string
  }>
}

/**
 * Base prompt templates for different code generation types
 */
export const PROMPT_TEMPLATES = {
  // React Component Generation
  REACT_COMPONENT: {
    name: 'React Component Generator',
    description: 'Generate React components with TypeScript and Tailwind CSS',
    template: `You are an expert React developer. Create a {componentType} component that meets these requirements:

{requirements}

Technical Requirements:
- Use TypeScript for type safety
- Use functional components with hooks
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper prop types and default values
- Add JSDoc comments for documentation
- Follow React best practices and conventions

Additional Context:
{context}

Return only the complete, production-ready React component code without explanations.`,
    variables: ['componentType', 'requirements', 'context']
  },

  // API Generation
  API_ENDPOINT: {
    name: 'API Endpoint Generator',
    description: 'Generate REST API endpoints with Express.js and TypeScript',
    template: `You are an expert backend developer. Create a {method} API endpoint for {resource} with these specifications:

{specifications}

Technical Requirements:
- Use Express.js with TypeScript
- Include proper request/response types
- Add input validation with Zod
- Implement error handling with appropriate HTTP status codes
- Include middleware for authentication if needed
- Add rate limiting for security
- Use Prisma for database operations
- Follow REST conventions

Database Schema Context:
{dbContext}

Return only the complete, production-ready API endpoint code without explanations.`,
    variables: ['method', 'resource', 'specifications', 'dbContext']
  },

  // Page Generation
  FULL_PAGE: {
    name: 'Full Page Generator',
    description: 'Generate complete page components with layout and SEO',
    template: `You are an expert full-stack developer. Create a complete {pageType} page with these requirements:

{requirements}

Page Structure:
{structure}

Technical Requirements:
- Use Next.js 14 with App Router
- Include proper SEO meta tags and Open Graph
- Implement responsive design with Tailwind CSS
- Add loading states and error boundaries
- Include accessibility features (ARIA labels, semantic HTML)
- Optimize for Core Web Vitals
- Use TypeScript throughout

Design System:
{designSystem}

Return only the complete, production-ready page component code without explanations.`,
    variables: ['pageType', 'requirements', 'structure', 'designSystem']
  },

  // Database Schema
  DATABASE_SCHEMA: {
    name: 'Database Schema Generator',
    description: 'Generate Prisma database schemas with relationships',
    template: `You are a database architect. Create a Prisma schema for {entityName} with these requirements:

{requirements}

Relationships:
{relationships}

Technical Requirements:
- Use PostgreSQL as the database provider
- Include proper field types and constraints
- Add indexes for performance optimization
- Implement soft deletes where appropriate
- Include audit fields (createdAt, updatedAt)
- Follow database normalization principles
- Add proper foreign key relationships

Existing Schema Context:
{existingSchema}

Return only the complete Prisma schema definition without explanations.`,
    variables: ['entityName', 'requirements', 'relationships', 'existingSchema']
  },

  // CSS/Styling
  STYLING: {
    name: 'Styling Generator',
    description: 'Generate CSS or Tailwind classes for components',
    template: `You are a CSS expert specializing in {framework}. Create styles for a {componentType} with these design requirements:

{designRequirements}

Style Guidelines:
- {framework} methodology
- Responsive design (mobile-first)
- Modern CSS features (Grid, Flexbox, Custom Properties)
- Smooth animations and transitions
- Dark/light theme support if requested
- High contrast for accessibility
- Print-friendly styles if applicable

Design System:
{designSystem}

Browser Support: {browserSupport}

Return only the complete styling code without explanations.`,
    variables: ['framework', 'componentType', 'designRequirements', 'designSystem', 'browserSupport']
  }
}

/**
 * Specialized prompt builders for specific use cases
 */
export class PromptBuilder {
  /**
   * Build a prompt for React component generation
   */
  static buildComponentPrompt(options: {
    type: string
    name: string
    description: string
    props?: Record<string, string>
    styling?: 'tailwind' | 'css' | 'styled-components'
    features?: string[]
    accessibility?: boolean
    responsive?: boolean
    theme?: Record<string, any>
  }): string {
    const template = PROMPT_TEMPLATES.REACT_COMPONENT.template
    
    let requirements = `Component Name: ${options.name}\nDescription: ${options.description}\n`
    
    if (options.props) {
      requirements += `\nProps Interface:\n${Object.entries(options.props)
        .map(([key, type]) => `- ${key}: ${type}`)
        .join('\n')}\n`
    }
    
    if (options.features) {
      requirements += `\nFeatures:\n${options.features.map(f => `- ${f}`).join('\n')}\n`
    }
    
    let context = `Styling: ${options.styling || 'tailwind'}\n`
    
    if (options.accessibility) {
      context += 'Accessibility: Include ARIA labels and keyboard navigation\n'
    }
    
    if (options.responsive) {
      context += 'Responsive: Mobile-first responsive design\n'
    }
    
    if (options.theme) {
      context += `Theme: ${JSON.stringify(options.theme, null, 2)}\n`
    }
    
    return template
      .replace('{componentType}', options.type)
      .replace('{requirements}', requirements)
      .replace('{context}', context)
  }

  /**
   * Build a prompt for API endpoint generation
   */
  static buildAPIPrompt(options: {
    method: string
    resource: string
    description: string
    requestBody?: Record<string, string>
    responseBody?: Record<string, string>
    authentication?: boolean
    validation?: boolean
    database?: string
    relationships?: string[]
  }): string {
    const template = PROMPT_TEMPLATES.API_ENDPOINT.template
    
    let specifications = `Description: ${options.description}\n`
    
    if (options.requestBody) {
      specifications += `\nRequest Body:\n${Object.entries(options.requestBody)
        .map(([key, type]) => `- ${key}: ${type}`)
        .join('\n')}\n`
    }
    
    if (options.responseBody) {
      specifications += `\nResponse Body:\n${Object.entries(options.responseBody)
        .map(([key, type]) => `- ${key}: ${type}`)
        .join('\n')}\n`
    }
    
    if (options.authentication) {
      specifications += '\nAuthentication: JWT token required\n'
    }
    
    if (options.validation) {
      specifications += 'Validation: Strict input validation required\n'
    }
    
    let dbContext = ''
    if (options.database) {
      dbContext += `Database: ${options.database}\n`
    }
    
    if (options.relationships) {
      dbContext += `Relationships: ${options.relationships.join(', ')}\n`
    }
    
    return template
      .replace('{method}', options.method)
      .replace('{resource}', options.resource)
      .replace('{specifications}', specifications)
      .replace('{dbContext}', dbContext)
  }

  /**
   * Build a prompt for full page generation
   */
  static buildPagePrompt(options: {
    type: string
    title: string
    description: string
    sections?: string[]
    layout?: string
    seo?: {
      title: string
      description: string
      keywords?: string[]
    }
    theme?: Record<string, any>
    responsive?: boolean
  }): string {
    const template = PROMPT_TEMPLATES.FULL_PAGE.template
    
    let requirements = `Title: ${options.title}\nDescription: ${options.description}\n`
    
    if (options.responsive !== false) {
      requirements += 'Responsive: Mobile-first responsive design\n'
    }
    
    let structure = ''
    if (options.sections) {
      structure = `Sections:\n${options.sections.map(s => `- ${s}`).join('\n')}\n`
    }
    
    if (options.layout) {
      structure += `Layout: ${options.layout}\n`
    }
    
    let designSystem = ''
    if (options.theme) {
      designSystem = `Theme Configuration:\n${JSON.stringify(options.theme, null, 2)}\n`
    }
    
    if (options.seo) {
      designSystem += `\nSEO Configuration:\n- Title: ${options.seo.title}\n- Description: ${options.seo.description}\n`
      if (options.seo.keywords) {
        designSystem += `- Keywords: ${options.seo.keywords.join(', ')}\n`
      }
    }
    
    return template
      .replace('{pageType}', options.type)
      .replace('{requirements}', requirements)
      .replace('{structure}', structure)
      .replace('{designSystem}', designSystem)
  }

  /**
   * Build a context-aware prompt based on existing components
   */
  static buildContextualPrompt(options: {
    basePrompt: string
    existingComponents?: Array<{
      name: string
      type: string
      description: string
    }>
    projectContext?: {
      type: string
      theme: Record<string, any>
      conventions?: string[]
    }
    userPreferences?: {
      codingStyle?: string
      framework?: string
      testing?: boolean
    }
  }): string {
    let contextualPrompt = options.basePrompt
    
    if (options.existingComponents && options.existingComponents.length > 0) {
      contextualPrompt += `\n\nExisting Components Context:\n${options.existingComponents
        .map(c => `- ${c.name} (${c.type}): ${c.description}`)
        .join('\n')}`
    }
    
    if (options.projectContext) {
      contextualPrompt += `\n\nProject Context:\n- Type: ${options.projectContext.type}\n`
      
      if (options.projectContext.theme) {
        contextualPrompt += `- Theme: ${JSON.stringify(options.projectContext.theme, null, 2)}\n`
      }
      
      if (options.projectContext.conventions) {
        contextualPrompt += `- Conventions: ${options.projectContext.conventions.join(', ')}\n`
      }
    }
    
    if (options.userPreferences) {
      contextualPrompt += `\n\nUser Preferences:\n`
      
      if (options.userPreferences.codingStyle) {
        contextualPrompt += `- Coding Style: ${options.userPreferences.codingStyle}\n`
      }
      
      if (options.userPreferences.framework) {
        contextualPrompt += `- Preferred Framework: ${options.userPreferences.framework}\n`
      }
      
      if (options.userPreferences.testing) {
        contextualPrompt += '- Include Tests: Yes\n'
      }
    }
    
    return contextualPrompt
  }
}

/**
 * Prompt optimization utilities
 */
export class PromptOptimizer {
  /**
   * Optimize prompt for token efficiency
   */
  static optimizeForTokens(prompt: string, maxTokens: number): string {
    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    const estimatedTokens = prompt.length / 4
    
    if (estimatedTokens <= maxTokens) {
      return prompt
    }
    
    // Reduce prompt length while maintaining essential information
    const lines = prompt.split('\n')
    const essentialLines: string[] = []
    const optionalLines: string[] = []
    
    lines.forEach(line => {
      if (line.includes('Requirements:') || line.includes('Technical') || line.trim().startsWith('-')) {
        essentialLines.push(line)
      } else {
        optionalLines.push(line)
      }
    })
    
    let optimizedPrompt = essentialLines.join('\n')
    
    // Add optional lines if we have token budget
    for (const line of optionalLines) {
      const testPrompt = optimizedPrompt + '\n' + line
      if (testPrompt.length / 4 > maxTokens) break
      optimizedPrompt = testPrompt
    }
    
    return optimizedPrompt
  }

  /**
   * Add few-shot examples to improve output quality
   */
  static addFewShotExamples(prompt: string, examples: Array<{
    input: string
    output: string
  }>): string {
    if (examples.length === 0) return prompt
    
    const examplesText = examples.map((example, index) => 
      `Example ${index + 1}:\nInput: ${example.input}\nOutput: ${example.output}`
    ).join('\n\n')
    
    return prompt + '\n\nExamples:\n' + examplesText + '\n\nNow generate for the current request:'
  }

  /**
   * Add step-by-step reasoning prompts for complex generations
   */
  static addChainOfThought(prompt: string): string {
    return prompt + `\n\nPlease follow these steps:
1. Analyze the requirements and break down the component structure
2. Determine the necessary props and state management
3. Plan the styling approach and responsive behavior
4. Consider accessibility requirements
5. Generate the complete, production-ready code

Now proceed with the generation:`
  }
}

/**
 * Prompt validation utilities
 */
export class PromptValidator {
  /**
   * Validate prompt structure and completeness
   */
  static validatePrompt(prompt: string): {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    
    // Check for minimum length
    if (prompt.length < 50) {
      issues.push('Prompt is too short and may not provide enough context')
    }
    
    // Check for maximum length (approximate token limit)
    if (prompt.length > 16000) {
      issues.push('Prompt may exceed token limits for some AI models')
    }
    
    // Check for essential elements
    if (!prompt.toLowerCase().includes('requirements')) {
      suggestions.push('Consider adding explicit requirements section')
    }
    
    if (!prompt.toLowerCase().includes('typescript') && !prompt.toLowerCase().includes('javascript')) {
      suggestions.push('Specify programming language preference')
    }
    
    if (!prompt.toLowerCase().includes('responsive')) {
      suggestions.push('Consider mentioning responsive design requirements')
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    }
  }
}

