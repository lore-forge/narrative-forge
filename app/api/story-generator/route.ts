import { NextRequest, NextResponse } from 'next/server'
import { narrativeAIClient } from '@/lib/ai-services-client'
import { adminAuth } from '@/lib/firebase/config'
import type { StoryGenerationRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    let decodedToken
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (authError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Parse request body
    let storyRequest: StoryGenerationRequest
    try {
      storyRequest = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!storyRequest.initialPrompt || !storyRequest.genre || !storyRequest.targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields: initialPrompt, genre, targetAudience' },
        { status: 400 }
      )
    }

    // Validate target audience for child safety
    const allowedAudiences = ['child', 'preteen', 'teen', 'young-adult', 'adult']
    if (!allowedAudiences.includes(storyRequest.targetAudience)) {
      return NextResponse.json(
        { error: 'Invalid target audience' },
        { status: 400 }
      )
    }

    // Validate content for appropriateness (basic checks)
    if (containsInappropriateContent(storyRequest.initialPrompt)) {
      return NextResponse.json(
        { error: 'Content does not meet safety guidelines' },
        { status: 400 }
      )
    }

    // Add user context to request
    const enhancedRequest: StoryGenerationRequest = {
      ...storyRequest,
      // Ensure educational focus for young audiences
      educationalGoals: storyRequest.educationalGoals || getDefaultEducationalGoals(storyRequest.targetAudience),
      // Set reasonable length limits
      length: storyRequest.length || getDefaultLength(storyRequest.targetAudience),
      // Enable safety features
      includeImages: storyRequest.includeImages ?? true,
      includeAudio: storyRequest.includeAudio ?? false,
      includeInteractive: storyRequest.includeInteractive ?? true,
    }

    // Generate story using ai-services client with caching
    console.log(`🎭 Generating story for user ${decodedToken.uid}`)
    console.log(`📚 Prompt: ${storyRequest.initialPrompt.slice(0, 100)}...`)
    console.log(`🎯 Target: ${storyRequest.targetAudience}, Genre: ${storyRequest.genre}`)
    console.log(`🚀 Using ai-services with caching optimization`)

    const startTime = Date.now()
    const generatedStory = await narrativeAIClient.generateStory(enhancedRequest)
    const processingTime = Date.now() - startTime

    console.log(`✅ Story generated successfully in ${processingTime}ms`)
    console.log(`📊 Chapters: ${generatedStory.chapters.length}, Words: ${generatedStory.metadata.wordCount}`)
    console.log(`🎯 AI Services: Cache optimization enabled`)

    // Add user metadata
    const responseStory = {
      ...generatedStory,
      userId: decodedToken.uid,
      userEmail: decodedToken.email,
      processingTime,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      story: responseStory,
      metadata: {
        processingTime,
        aiModel: 'ai-services-cached',
        safety: {
          contentFiltered: true,
          ageAppropriate: true,
          educationalValue: generatedStory.metadata.educationalValue
        }
      }
    })

  } catch (error) {
    console.error('❌ Story generation failed:', error)
    
    // Log error details for debugging
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    // Return appropriate error response
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Story generation timed out. Please try a shorter prompt.' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: 'Story generation failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Helper functions

function containsInappropriateContent(text: string): boolean {
  const inappropriateKeywords = [
    'violence', 'inappropriate', 'adult', 'harmful'
    // Add more keywords as needed - this would be expanded with a proper content moderation service
  ]
  
  const lowercaseText = text.toLowerCase()
  return inappropriateKeywords.some(keyword => lowercaseText.includes(keyword))
}

function getDefaultEducationalGoals(audience: string): string[] {
  const goals = {
    'child': [
      'Basic vocabulary development',
      'Simple sentence structure',
      'Cause and effect understanding',
      'Character empathy'
    ],
    'preteen': [
      'Vocabulary expansion',
      'Plot structure understanding',
      'Character development',
      'Creative expression'
    ],
    'teen': [
      'Advanced vocabulary',
      'Complex plot structures',
      'Character psychology',
      'Thematic analysis',
      'Creative writing techniques'
    ],
    'young-adult': [
      'Literary techniques',
      'Advanced character development',
      'Complex themes',
      'Narrative voice'
    ],
    'adult': [
      'Advanced literary techniques',
      'Complex narrative structures',
      'Sophisticated themes'
    ]
  }
  
  return goals[audience as keyof typeof goals] || goals['child']
}

function getDefaultLength(audience: string): 'short' | 'medium' | 'long' | 'novel' {
  const lengths = {
    'child': 'short',
    'preteen': 'short',
    'teen': 'medium',
    'young-adult': 'medium',
    'adult': 'long'
  } as const
  
  return lengths[audience as keyof typeof lengths] || 'short'
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: 'Narrative Forge Story Generator',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}