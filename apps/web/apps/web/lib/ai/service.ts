import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { DatabaseService } from '../db'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface AIGenerationOptions {
  userId: string
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'claude-3-haiku'
  temperature?: number
  maxTokens?: number
}

export interface ContentGenerationRequest {
  componentType: string
  fieldType: string
  context?: {
    projectName?: string
    industry?: string
    tone?: string
    audience?: string
    existing?: string
  }
  examples?: string[]
}

export interface StyleGenerationRequest {
  componentType: string
  currentStyles?: Record<string, any>
  designSystem?: {
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    borderRadius?: string
  }
  context?: {
    brand?: string
    style?: 'modern' | 'classic' | 'minimal' | 'bold'
  }
}

export class AIService {
  static async generateContent(
    request: ContentGenerationRequest,
    options: AIGenerationOptions
  ): Promise<string> {
    const startTime = Date.now()
    const model = options.model || 'gpt-4'
    
    try {
      let result: string
      let tokensUsed = 0
      let cost = 0

      const prompt = this.buildContentPrompt(request)

      if (model.startsWith('gpt')) {
        const completion = await openai.chat.completions.create({
          model: model as 'gpt-4' | 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert copywriter and UX designer who creates compelling, professional content for websites. Your writing is clear, engaging, and optimized for conversion.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 500,
        })

        result = completion.choices[0]?.message?.content || ''
        tokensUsed = completion.usage?.total_tokens || 0
        cost = this.calculateOpenAICost(model, tokensUsed)

      } else if (model.startsWith('claude')) {
        const message = await anthropic.messages.create({
          model: model as 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307',
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })

        result = message.content[0]?.type === 'text' ? message.content[0].text : ''
        tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0
        cost = this.calculateAnthropicCost(model, tokensUsed)
      } else {
        throw new Error(`Unsupported model: ${model}`)
      }

      // Track usage
      await DatabaseService.trackAIUsage({
        userId: options.userId,
        type: 'CONTENT_GENERATION',
        model,
        tokensUsed,
        cost,
        requestData: request,
        responseData: { content: result },
        processingTimeMs: Date.now() - startTime
      })

      return result.trim()

    } catch (error) {
      console.error('AI content generation error:', error)
      throw new Error('Failed to generate content with AI')
    }
  }

  static async generateStyles(
    request: StyleGenerationRequest,
    options: AIGenerationOptions
  ): Promise<Record<string, string>> {
    const startTime = Date.now()
    const model = options.model || 'gpt-4'
    
    try {
      const prompt = this.buildStylePrompt(request)
      let result: string
      let tokensUsed = 0
      let cost = 0

      if (model.startsWith('gpt')) {
        const completion = await openai.chat.completions.create({
          model: model as 'gpt-4' | 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert UI/UX designer and CSS developer. You create beautiful, modern, and accessible design systems. Return only valid CSS properties as a JSON object.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.3,
          max_tokens: options.maxTokens || 800,
        })

        result = completion.choices[0]?.message?.content || '{}'
        tokensUsed = completion.usage?.total_tokens || 0
        cost = this.calculateOpenAICost(model, tokensUsed)

      } else if (model.startsWith('claude')) {
        const message = await anthropic.messages.create({
          model: model as 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307',
          max_tokens: options.maxTokens || 800,
          temperature: options.temperature || 0.3,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })

        result = message.content[0]?.type === 'text' ? message.content[0].text : '{}'
        tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0
        cost = this.calculateAnthropicCost(model, tokensUsed)
      } else {
        throw new Error(`Unsupported model: ${model}`)
      }

      // Parse JSON response
      let styles: Record<string, string>
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || result.match(/```\s*([\s\S]*?)\s*```/)
        const jsonStr = jsonMatch ? jsonMatch[1] : result
        styles = JSON.parse(jsonStr)
      } catch (parseError) {
        console.error('Failed to parse AI style response:', result)
        styles = this.generateFallbackStyles(request.componentType)
      }

      // Track usage
      await DatabaseService.trackAIUsage({
        userId: options.userId,
        type: 'STYLE_SUGGESTION',
        model,
        tokensUsed,
        cost,
        requestData: request,
        responseData: styles,
        processingTimeMs: Date.now() - startTime
      })

      return styles

    } catch (error) {
      console.error('AI style generation error:', error)
      return this.generateFallbackStyles(request.componentType)
    }
  }

  static async generateCode(
    componentType: string,
    props: Record<string, any>,
    styles: Record<string, any>,
    options: AIGenerationOptions
  ): Promise<string> {
    const startTime = Date.now()
    const model = options.model || 'gpt-4'
    
    try {
      const prompt = `Generate a React component for a ${componentType} with the following props and styles:
      
Props: ${JSON.stringify(props, null, 2)}
Styles: ${JSON.stringify(styles, null, 2)}

Requirements:
- Use TypeScript
- Use Tailwind CSS classes where possible
- Make it responsive
- Include proper accessibility attributes
- Follow modern React patterns
- Return only the component code, no explanations

Component:`

      let result: string
      let tokensUsed = 0
      let cost = 0

      if (model.startsWith('gpt')) {
        const completion = await openai.chat.completions.create({
          model: model as 'gpt-4' | 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert React developer who writes clean, performant, and accessible code using TypeScript and Tailwind CSS.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1500,
        })

        result = completion.choices[0]?.message?.content || ''
        tokensUsed = completion.usage?.total_tokens || 0
        cost = this.calculateOpenAICost(model, tokensUsed)

      } else {
        const message = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1500,
          temperature: 0.2,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })

        result = message.content[0]?.type === 'text' ? message.content[0].text : ''
        tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0
        cost = this.calculateAnthropicCost('claude-3-sonnet-20240229', tokensUsed)
      }

      // Track usage
      await DatabaseService.trackAIUsage({
        userId: options.userId,
        type: 'CODE_GENERATION',
        model,
        tokensUsed,
        cost,
        requestData: { componentType, props, styles },
        responseData: { code: result },
        processingTimeMs: Date.now() - startTime
      })

      return result.trim()

    } catch (error) {
      console.error('AI code generation error:', error)
      throw new Error('Failed to generate code with AI')
    }
  }

  private static buildContentPrompt(request: ContentGenerationRequest): string {
    const { componentType, fieldType, context = {}, examples = [] } = request
    
    let prompt = `Generate ${fieldType} content for a ${componentType} component.`
    
    if (context.projectName) {
      prompt += ` This is for a project called "${context.projectName}".`
    }
    
    if (context.industry) {
      prompt += ` The industry/niche is ${context.industry}.`
    }
    
    if (context.tone) {
      prompt += ` Use a ${context.tone} tone.`
    }
    
    if (context.audience) {
      prompt += ` The target audience is ${context.audience}.`
    }
    
    if (context.existing) {
      prompt += ` Here's existing content for context: "${context.existing}"`
    }

    if (examples.length > 0) {
      prompt += `\n\nHere are some examples of good ${fieldType}:\n${examples.join('\n')}`
    }

    prompt += `\n\nGenerate compelling, professional ${fieldType} that would work well for this ${componentType}. Make it engaging and conversion-focused. Return only the content, no quotes or explanations.`
    
    return prompt
  }

  private static buildStylePrompt(request: StyleGenerationRequest): string {
    const { componentType, currentStyles = {}, designSystem = {}, context = {} } = request
    
    let prompt = `Generate modern CSS styles for a ${componentType} component. `
    
    if (Object.keys(currentStyles).length > 0) {
      prompt += `Current styles: ${JSON.stringify(currentStyles, null, 2)}\n\n`
    }
    
    if (Object.keys(designSystem).length > 0) {
      prompt += `Design system: ${JSON.stringify(designSystem, null, 2)}\n\n`
    }
    
    if (context.brand) {
      prompt += `Brand: ${context.brand}\n`
    }
    
    if (context.style) {
      prompt += `Style preference: ${context.style}\n`
    }

    prompt += `
Requirements:
- Modern, clean design
- Good contrast and accessibility
- Responsive design principles  
- Use the design system colors if provided
- Include hover and focus states where appropriate
- Return as a JSON object with camelCase CSS properties
- Use CSS values (colors, sizes, etc.), not Tailwind classes

Return only a valid JSON object with the CSS properties.`

    return prompt
  }

  private static generateFallbackStyles(componentType: string): Record<string, string> {
    const baseStyles = {
      padding: '1rem',
      borderRadius: '0.375rem',
      transition: 'all 0.2s ease-in-out'
    }

    switch (componentType) {
      case 'HERO':
        return {
          ...baseStyles,
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '4rem 2rem',
          textAlign: 'center'
        }
      case 'BUTTON':
        return {
          ...baseStyles,
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          cursor: 'pointer'
        }
      case 'CARD':
        return {
          ...baseStyles,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }
      default:
        return baseStyles
    }
  }

  private static calculateOpenAICost(model: string, tokens: number): number {
    // Pricing as of 2024 (per 1K tokens)
    const pricing = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002
    }
    return (tokens / 1000) * (pricing[model as keyof typeof pricing] || 0.03)
  }

  private static calculateAnthropicCost(model: string, tokens: number): number {
    // Pricing as of 2024 (per 1K tokens)
    const pricing = {
      'claude-3-sonnet-20240229': 0.015,
      'claude-3-haiku-20240307': 0.00025
    }
    return (tokens / 1000) * (pricing[model as keyof typeof pricing] || 0.015)
  }

  // Chat assistance for help system
  static async generateChatResponse(
    message: string,
    context: {
      userId: string
      currentComponent?: any
      projectContext?: any
    }
  ): Promise<string> {
    const startTime = Date.now()
    
    try {
      let systemPrompt = `You are an AI assistant for a website builder platform. You help users create websites by:
- Answering questions about web design and development
- Suggesting improvements to their components and layouts
- Helping with content creation
- Providing guidance on best practices
- Troubleshooting issues

Be helpful, friendly, and concise. Focus on practical advice.`

      if (context.currentComponent) {
        systemPrompt += `\n\nCurrent component context: ${JSON.stringify(context.currentComponent, null, 2)}`
      }

      if (context.projectContext) {
        systemPrompt += `\n\nProject context: ${JSON.stringify(context.projectContext, null, 2)}`
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again."
      const tokensUsed = completion.usage?.total_tokens || 0
      const cost = this.calculateOpenAICost('gpt-3.5-turbo', tokensUsed)

      // Track usage
      await DatabaseService.trackAIUsage({
        userId: context.userId,
        type: 'CHAT_ASSISTANCE',
        model: 'gpt-3.5-turbo',
        tokensUsed,
        cost,
        requestData: { message, context },
        responseData: { response },
        processingTimeMs: Date.now() - startTime
      })

      return response

    } catch (error) {
      console.error('AI chat error:', error)
      return "I'm experiencing some technical difficulties. Please try again later."
    }
  }
}