import { OpenAI } from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import { z } from 'zod'
import prettier from 'prettier'
import { js as jsBeautify, css as cssBeautify, html as htmlBeautify } from 'js-beautify'
import * as babel from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

// Types and schemas
export const GenerationRequestSchema = z.object({
  prompt: z.string(),
  type: z.enum(['component', 'page', 'api', 'database', 'full-stack']),
  framework: z.enum(['react', 'vue', 'angular', 'vanilla']).default('react'),
  language: z.enum(['typescript', 'javascript']).default('typescript'),
  styling: z.enum(['tailwind', 'css', 'styled-components', 'emotion']).default('tailwind'),
  context: z.object({
    projectType: z.string().optional(),
    existingComponents: z.array(z.any()).optional(),
    theme: z.record(z.any()).optional(),
    requirements: z.array(z.string()).optional()
  }).optional()
})

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>

export interface GenerationResult {
  code: string
  language: string
  framework: string
  dependencies: string[]
  explanation: string
  suggestions: string[]
  tokens?: number
  cost?: number
  isValid: boolean
  errors?: string[]
}

export interface AIProvider {
  name: 'openai' | 'anthropic'
  model: string
  apiKey: string
}

/**
 * Main AI Engine class for code generation
 */
export class AIEngine {
  private openai?: OpenAI
  private anthropic?: Anthropic
  private defaultProvider: AIProvider
  
  constructor(providers: AIProvider[]) {
    // Initialize AI providers
    providers.forEach(provider => {
      if (provider.name === 'openai') {
        this.openai = new OpenAI({ apiKey: provider.apiKey })
        if (!this.defaultProvider) this.defaultProvider = provider
      } else if (provider.name === 'anthropic') {
        this.anthropic = new Anthropic({ apiKey: provider.apiKey })
        if (!this.defaultProvider) this.defaultProvider = provider
      }
    })
    
    if (!this.defaultProvider) {
      throw new Error('At least one AI provider must be configured')
    }
  }

  /**
   * Generate code based on a natural language prompt
   */
  async generateCode(request: GenerationRequest): Promise<GenerationResult> {
    try {
      // Validate input
      const validatedRequest = GenerationRequestSchema.parse(request)
      
      // Build context-aware prompt
      const prompt = await this.buildPrompt(validatedRequest)
      
      // Generate code using AI
      const response = await this.callAIProvider(prompt, validatedRequest)
      
      // Parse and validate generated code
      const parsedResult = this.parseGeneratedCode(response, validatedRequest)
      
      // Format and beautify code
      const formattedCode = await this.formatCode(parsedResult.code, validatedRequest.language)
      
      // Validate syntax
      const validation = this.validateCode(formattedCode, validatedRequest)
      
      return {
        code: formattedCode,
        language: validatedRequest.language,
        framework: validatedRequest.framework,
        dependencies: parsedResult.dependencies || [],
        explanation: parsedResult.explanation || 'Generated code based on your requirements',
        suggestions: parsedResult.suggestions || [],
        tokens: response.tokens,
        cost: response.cost,
        isValid: validation.isValid,
        errors: validation.errors
      }
      
    } catch (error) {
      console.error('Code generation failed:', error)
      
      return {
        code: '',
        language: request.language || 'typescript',
        framework: request.framework || 'react',
        dependencies: [],
        explanation: 'Code generation failed',
        suggestions: [],
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Build context-aware prompt for AI generation
   */
  private async buildPrompt(request: GenerationRequest): Promise<string> {
    const { type, framework, language, styling, context, prompt } = request
    
    let systemPrompt = `You are an expert ${framework} developer specializing in ${language}. `
    systemPrompt += `You create high-quality, production-ready code that follows best practices.`
    
    let userPrompt = `Generate a ${type} using ${framework} with ${language} and ${styling} for styling.\n\n`
    
    // Add context if provided
    if (context) {
      if (context.projectType) {
        userPrompt += `Project type: ${context.projectType}\n`
      }
      if (context.theme) {
        userPrompt += `Theme configuration: ${JSON.stringify(context.theme, null, 2)}\n`
      }
      if (context.requirements) {
        userPrompt += `Requirements:\n${context.requirements.map(r => `- ${r}`).join('\n')}\n`
      }
    }
    
    userPrompt += `\n${prompt}\n\n`
    
    // Add generation guidelines based on type
    userPrompt += this.getGenerationGuidelines(type, framework, language, styling)
    
    return `${systemPrompt}\n\n${userPrompt}`
  }

  /**
   * Get specific guidelines based on generation type
   */
  private getGenerationGuidelines(
    type: string, 
    framework: string, 
    language: string, 
    styling: string
  ): string {
    const base = `
Please return ONLY the code without explanations or markdown formatting.
Make the code:
- Production-ready and well-structured
- Responsive and accessible
- TypeScript-first if language is typescript
- Following ${framework} best practices
- Using ${styling} for styling
`

    const specific = {
      component: `
- Create a reusable component with proper props interface
- Include proper TypeScript types
- Add appropriate default props
- Make it responsive and accessible
- Include proper error handling
`,
      page: `
- Create a complete page component
- Include proper SEO meta tags
- Implement responsive design
- Add loading states and error boundaries
- Structure with semantic HTML
`,
      api: `
- Create RESTful API endpoints
- Include proper validation and error handling
- Add authentication middleware if needed
- Follow REST conventions
- Include proper TypeScript types for requests/responses
`,
      database: `
- Create proper database schema
- Include relationships and constraints
- Add indexes for performance
- Follow normalization principles
- Include seed data if appropriate
`,
      'full-stack': `
- Create both frontend and backend code
- Ensure proper integration between layers
- Include error handling and validation
- Follow architectural best practices
- Add proper authentication flow
`
    }

    return base + (specific[type as keyof typeof specific] || '')
  }

  /**
   * Call the AI provider to generate code
   */
  private async callAIProvider(prompt: string, request: GenerationRequest): Promise<{
    content: string
    tokens?: number
    cost?: number
  }> {
    if (this.defaultProvider.name === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: this.defaultProvider.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })

      return {
        content: response.choices[0]?.message?.content || '',
        tokens: response.usage?.total_tokens,
        cost: this.calculateCost(response.usage?.total_tokens || 0, 'openai')
      }
    } else if (this.defaultProvider.name === 'anthropic' && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: this.defaultProvider.model || 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]?.type === 'text' ? response.content[0].text : ''
      
      return {
        content,
        tokens: response.usage.input_tokens + response.usage.output_tokens,
        cost: this.calculateCost(response.usage.input_tokens + response.usage.output_tokens, 'anthropic')
      }
    }

    throw new Error('No AI provider available')
  }

  /**
   * Parse generated code and extract metadata
   */
  private parseGeneratedCode(response: string, request: GenerationRequest): {
    code: string
    dependencies?: string[]
    explanation?: string
    suggestions?: string[]
  } {
    // Clean up the response - remove markdown formatting if present
    let code = response
    
    // Remove markdown code blocks
    code = code.replace(/```[\w]*\n?/g, '').replace(/```/g, '')
    
    // Extract dependencies from import statements
    const dependencies: string[] = []
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g
    let match
    
    while ((match = importRegex.exec(code)) !== null) {
      const dep = match[1]
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        dependencies.push(dep)
      }
    }

    return {
      code: code.trim(),
      dependencies: [...new Set(dependencies)], // Remove duplicates
    }
  }

  /**
   * Format code using appropriate formatter
   */
  private async formatCode(code: string, language: string): Promise<string> {
    try {
      if (language === 'typescript' || language === 'javascript') {
        return await prettier.format(code, {
          parser: language === 'typescript' ? 'typescript' : 'babel',
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5'
        })
      } else if (code.includes('<style>') || code.toLowerCase().includes('css')) {
        return cssBeautify(code)
      } else if (code.includes('<html>') || code.includes('<!DOCTYPE')) {
        return htmlBeautify(code)
      }
      
      return jsBeautify(code)
    } catch (error) {
      console.warn('Code formatting failed, returning original:', error)
      return code
    }
  }

  /**
   * Validate generated code syntax
   */
  private validateCode(code: string, request: GenerationRequest): {
    isValid: boolean
    errors?: string[]
  } {
    try {
      if (request.language === 'javascript' || request.language === 'typescript') {
        babel.parse(code, {
          sourceType: 'module',
          plugins: [
            'jsx',
            'typescript',
            'decorators-legacy',
            'classProperties',
            'objectRestSpread'
          ]
        })
      }
      
      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Syntax validation failed']
      }
    }
  }

  /**
   * Calculate approximate cost for AI API usage
   */
  private calculateCost(tokens: number, provider: 'openai' | 'anthropic'): number {
    // Approximate pricing (update with actual rates)
    const rates = {
      openai: 0.00003, // $0.03 per 1K tokens for GPT-4
      anthropic: 0.000008 // $0.008 per 1K tokens for Claude-3-Sonnet
    }
    
    return (tokens / 1000) * rates[provider]
  }

  /**
   * Generate component with specific optimizations
   */
  async generateComponent(
    prompt: string,
    options: {
      framework?: 'react' | 'vue' | 'angular'
      language?: 'typescript' | 'javascript'
      styling?: 'tailwind' | 'css' | 'styled-components'
      props?: Record<string, any>
      responsive?: boolean
      accessible?: boolean
    } = {}
  ): Promise<GenerationResult> {
    const request: GenerationRequest = {
      prompt,
      type: 'component',
      framework: options.framework || 'react',
      language: options.language || 'typescript',
      styling: options.styling || 'tailwind',
      context: {
        requirements: [
          ...(options.responsive ? ['Make it responsive'] : []),
          ...(options.accessible ? ['Include accessibility features'] : []),
          ...(options.props ? [`Props interface: ${JSON.stringify(options.props)}`] : [])
        ]
      }
    }
    
    return this.generateCode(request)
  }

  /**
   * Generate API endpoint
   */
  async generateAPI(
    prompt: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      authentication?: boolean
      validation?: boolean
      database?: string
    } = {}
  ): Promise<GenerationResult> {
    const request: GenerationRequest = {
      prompt,
      type: 'api',
      framework: 'react', // Not used for API
      language: 'typescript',
      context: {
        requirements: [
          ...(options.method ? [`HTTP method: ${options.method}`] : []),
          ...(options.authentication ? ['Include authentication'] : []),
          ...(options.validation ? ['Add input validation'] : []),
          ...(options.database ? [`Database: ${options.database}`] : [])
        ]
      }
    }
    
    return this.generateCode(request)
  }

  /**
   * Generate complete page
   */
  async generatePage(
    prompt: string,
    options: {
      layout?: string
      components?: string[]
      seo?: boolean
      responsive?: boolean
    } = {}
  ): Promise<GenerationResult> {
    const request: GenerationRequest = {
      prompt,
      type: 'page',
      framework: 'react',
      language: 'typescript',
      styling: 'tailwind',
      context: {
        requirements: [
          ...(options.layout ? [`Layout: ${options.layout}`] : []),
          ...(options.components ? [`Components: ${options.components.join(', ')}`] : []),
          ...(options.seo ? ['Include SEO optimization'] : []),
          ...(options.responsive ? ['Make it responsive'] : [])
        ]
      }
    }
    
    return this.generateCode(request)
  }
}

export * from './generators'
export * from './prompts'