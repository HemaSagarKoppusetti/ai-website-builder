import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth/config'
import { AIService } from '../../../../lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = await AIService.generateChatResponse(message, {
      userId: session.user.id,
      currentComponent: context?.currentComponent,
      projectContext: context?.projectContext
    })

    return NextResponse.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Chat failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}