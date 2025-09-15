import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth/config'
import { AIService, ContentGenerationRequest } from '../../../../lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...requestData } = body

    if (type === 'content') {
      const contentRequest: ContentGenerationRequest = requestData
      const content = await AIService.generateContent(contentRequest, {
        userId: session.user.id,
        model: 'gpt-3.5-turbo' // Use faster model for content
      })

      return NextResponse.json({ 
        success: true, 
        content,
        usage: {
          type: 'content_generation',
          timestamp: new Date().toISOString()
        }
      })

    } else if (type === 'styles') {
      const styles = await AIService.generateStyles(requestData, {
        userId: session.user.id,
        model: 'gpt-3.5-turbo'
      })

      return NextResponse.json({ 
        success: true, 
        styles,
        usage: {
          type: 'style_generation',
          timestamp: new Date().toISOString()
        }
      })

    } else if (type === 'code') {
      const { componentType, props, styles } = requestData
      const code = await AIService.generateCode(componentType, props, styles, {
        userId: session.user.id,
        model: 'gpt-4' // Use better model for code
      })

      return NextResponse.json({ 
        success: true, 
        code,
        usage: {
          type: 'code_generation',
          timestamp: new Date().toISOString()
        }
      })

    } else {
      return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 })
    }

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'AI generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}