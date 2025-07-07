/**
 * AI Services Client for Narrative Forge Module
 * Integrates with lore-forge-ai-services Cloud Functions and local library
 */

import { 
  AIServicesClient as BaseAIServicesClient,
  FirebaseCacheManager,
  VertexAIService,
  GoogleCloudAuthenticator 
} from 'lore-forge-ai-services'
import type {
  StoryGenerationRequest,
  GeneratedStory,
  GeneratedChapter,
  StoryContext,
  SkillAssessment,
  EducationalFeedback
} from '@/types'

export class NarrativeAIServicesClient {
  private baseClient: BaseAIServicesClient
  private cacheManager: FirebaseCacheManager
  private vertexAIService: VertexAIService
  private isServerSide: boolean

  constructor() {
    this.isServerSide = typeof window === 'undefined'
    
    // Initialize base AI services client
    this.baseClient = new BaseAIServicesClient({
      baseURL: this.getCloudFunctionURL(),
      timeout: 120000, // 2 minutes for story generation
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Initialize cache manager
    this.cacheManager = FirebaseCacheManager.getInstance()

    // Initialize Vertex AI service for server-side operations
    if (this.isServerSide) {
      const authenticator = new GoogleCloudAuthenticator()
      this.vertexAIService = new VertexAIService(authenticator)
    }
  }

  /**
   * Generate a complete story using Cloud Functions or local service
   */
  async generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    try {
      // Try Cloud Functions first
      if (this.getCloudFunctionURL()) {
        console.log('🌐 Using Cloud Functions for story generation')
        return await this.generateStoryViaCloudFunction(request)
      }

      // Fallback to local service on server-side
      if (this.isServerSide) {
        console.log('🏠 Using local AI service for story generation')
        return await this.generateStoryViaLocalService(request)
      }

      throw new Error('No AI service available for story generation')
      
    } catch (error) {
      console.error('Story generation failed:', error)
      throw new Error(`Failed to generate story: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate next chapter using optimal service
   */
  async generateChapter(context: StoryContext): Promise<GeneratedChapter> {
    try {
      const cacheKey = this.generateChapterCacheKey(context)
      
      // Check cache first
      const cachedChapter = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateChapter',
        prompt: cacheKey,
        model: 'gemini-1.5-pro'
      }, 'CACHE_FIRST')

      if (cachedChapter?.data) {
        console.log('✅ Chapter retrieved from cache')
        return cachedChapter.data
      }

      // Generate new chapter
      let chapter: GeneratedChapter
      
      if (this.getCloudFunctionURL()) {
        chapter = await this.generateChapterViaCloudFunction(context)
      } else if (this.isServerSide) {
        chapter = await this.generateChapterViaLocalService(context)
      } else {
        throw new Error('No AI service available for chapter generation')
      }

      // Cache the result
      await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateChapter',  
        prompt: cacheKey,
        model: 'gemini-1.5-pro'
      }, 'CACHE_ONLY', chapter)

      return chapter

    } catch (error) {
      console.error('Chapter generation failed:', error)
      throw new Error(`Failed to generate chapter: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Assess writing skills for educational features
   */
  async assessWritingSkills(text: string, userId: string): Promise<SkillAssessment> {
    try {
      const assessmentKey = `skill-assessment:${userId}:${this.generateTextHash(text)}`
      
      // Check cache first
      const cachedAssessment = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'assessSkills',
        prompt: assessmentKey,
        model: 'gemini-1.5-pro'
      }, 'CACHE_FIRST')

      if (cachedAssessment?.data) {
        console.log('✅ Skill assessment retrieved from cache')
        return cachedAssessment.data
      }

      // Generate new assessment
      let assessment: SkillAssessment
      
      if (this.getCloudFunctionURL()) {
        assessment = await this.assessSkillsViaCloudFunction(text, userId)
      } else if (this.isServerSide) {
        assessment = await this.assessSkillsViaLocalService(text, userId)
      } else {
        throw new Error('No AI service available for skill assessment')
      }

      // Cache the assessment
      await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'assessSkills',
        prompt: assessmentKey,
        model: 'gemini-1.5-pro'
      }, 'CACHE_ONLY', assessment)

      return assessment

    } catch (error) {
      console.error('Skill assessment failed:', error)
      throw new Error(`Failed to assess writing skills: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate educational feedback for writing
   */
  async generateEducationalFeedback(
    text: string, 
    skillAssessment: SkillAssessment,
    userId: string
  ): Promise<EducationalFeedback> {
    try {
      const feedbackKey = `feedback:${userId}:${this.generateTextHash(text)}:${skillAssessment.overall.level}`
      
      // Check cache first
      const cachedFeedback = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateFeedback',
        prompt: feedbackKey,
        model: 'gemini-1.5-pro'
      }, 'CACHE_FIRST')

      if (cachedFeedback?.data) {
        console.log('✅ Educational feedback retrieved from cache')
        return cachedFeedback.data
      }

      // Generate new feedback
      let feedback: EducationalFeedback
      
      if (this.getCloudFunctionURL()) {
        feedback = await this.generateFeedbackViaCloudFunction(text, skillAssessment, userId)
      } else if (this.isServerSide) {
        feedback = await this.generateFeedbackViaLocalService(text, skillAssessment, userId)
      } else {
        throw new Error('No AI service available for educational feedback')
      }

      // Cache the feedback
      await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateFeedback',
        prompt: feedbackKey,
        model: 'gemini-1.5-pro'
      }, 'CACHE_ONLY', feedback)

      return feedback

    } catch (error) {
      console.error('Educational feedback generation failed:', error)
      throw new Error(`Failed to generate educational feedback: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Private helper methods for different service implementations

  private async generateStoryViaCloudFunction(request: StoryGenerationRequest): Promise<GeneratedStory> {
    const response = await this.baseClient.post('/narrative/generate-story', {
      ...request,
      source: 'narrative-forge',
      timestamp: new Date().toISOString()
    })

    return response.data
  }

  private async generateStoryViaLocalService(request: StoryGenerationRequest): Promise<GeneratedStory> {
    // Use local VertexAI service when Cloud Functions unavailable
    const prompt = this.buildStoryGenerationPrompt(request)
    
    const result = await this.vertexAIService.generateText({
      prompt,
      model: 'gemini-1.5-pro',
      temperature: 0.8,
      maxOutputTokens: 4096
    })

    return this.parseStoryFromResponse(result.text, request)
  }

  private async generateChapterViaCloudFunction(context: StoryContext): Promise<GeneratedChapter> {
    const response = await this.baseClient.post('/narrative/generate-chapter', {
      context,
      source: 'narrative-forge',
      timestamp: new Date().toISOString()
    })

    return response.data
  }

  private async generateChapterViaLocalService(context: StoryContext): Promise<GeneratedChapter> {
    const prompt = this.buildChapterGenerationPrompt(context)
    
    const result = await this.vertexAIService.generateText({
      prompt,
      model: 'gemini-1.5-pro',
      temperature: 0.8,
      maxOutputTokens: 2048
    })

    return this.parseChapterFromResponse(result.text, context)
  }

  private async assessSkillsViaCloudFunction(text: string, userId: string): Promise<SkillAssessment> {
    const response = await this.baseClient.post('/narrative/assess-skills', {
      text,
      userId,
      source: 'narrative-forge',
      timestamp: new Date().toISOString()
    })

    return response.data
  }

  private async assessSkillsViaLocalService(text: string, userId: string): Promise<SkillAssessment> {
    const prompt = this.buildSkillAssessmentPrompt(text)
    
    const result = await this.vertexAIService.generateText({
      prompt,
      model: 'gemini-1.5-pro',
      temperature: 0.3,
      maxOutputTokens: 1024
    })

    return this.parseSkillAssessmentFromResponse(result.text)
  }

  private async generateFeedbackViaCloudFunction(
    text: string, 
    skillAssessment: SkillAssessment,
    userId: string
  ): Promise<EducationalFeedback> {
    const response = await this.baseClient.post('/narrative/generate-feedback', {
      text,
      skillAssessment,
      userId,
      source: 'narrative-forge',
      timestamp: new Date().toISOString()
    })

    return response.data
  }

  private async generateFeedbackViaLocalService(
    text: string, 
    skillAssessment: SkillAssessment,
    userId: string
  ): Promise<EducationalFeedback> {
    const prompt = this.buildEducationalFeedbackPrompt(text, skillAssessment)
    
    const result = await this.vertexAIService.generateText({
      prompt,
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxOutputTokens: 1024
    })

    return this.parseEducationalFeedbackFromResponse(result.text, skillAssessment)
  }

  // Utility methods

  private getCloudFunctionURL(): string | null {
    return process.env.CLOUD_NARRATIVE_GENERATION_FULLURL || 
           process.env.CLOUD_CHARACTER_CREATION_FULLURL?.replace('character-creator', 'narrative-generator') ||
           null
  }

  private generateChapterCacheKey(context: StoryContext): string {
    return `chapter:${context.storyId}:${context.currentChapter}:${this.generateTextHash(context.narrative.slice(-200))}`
  }

  private generateTextHash(text: string): string {
    // Simple hash for caching purposes
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private buildStoryGenerationPrompt(request: StoryGenerationRequest): string {
    return `Generate a complete story with the following specifications:

Initial Prompt: ${request.initialPrompt}
Genre: ${request.genre}
Target Audience: ${request.targetAudience}
Length: ${request.length}
Chapter Count: ${request.chapterCount || 5}

${request.characters ? `Characters: ${request.characters.map(c => `${c.name} (${c.narrativeRole})`).join(', ')}` : ''}
${request.worldContext ? `World: ${request.worldContext.name} - ${request.worldContext.description}` : ''}
${request.skillTargets ? `Educational Focus: ${request.skillTargets.map(s => s.skill).join(', ')}` : ''}

Please generate a complete story structure with chapters, character development, and age-appropriate content.
Return the response in JSON format with title, description, synopsis, and chapters array.`
  }

  private buildChapterGenerationPrompt(context: StoryContext): string {
    return `Continue the following story by writing the next chapter:

Story Title: ${context.storyTitle}
Current Chapter: ${context.currentChapter + 1}
Previous Narrative: ${context.narrative.slice(-1000)}
Characters: ${context.characters.map(c => c.name).join(', ')}

Write a compelling chapter (800-1200 words) that:
- Advances the plot naturally
- Maintains character consistency
- Matches the established tone and style
- Is appropriate for the target audience

Focus on engaging dialogue, vivid descriptions, and plot progression.`
  }

  private buildSkillAssessmentPrompt(text: string): string {
    return `Analyze the following text for writing skills assessment:

Text to analyze:
${text}

Please assess the writing across these dimensions:
1. Vocabulary (diversity, complexity, age-appropriateness)
2. Grammar (accuracy, sentence structure, punctuation)
3. Narrative Structure (organization, flow, coherence)
4. Creativity (originality, imagination, character development)
5. Style (voice, tone, descriptive language)

Return the assessment in JSON format with scores (1-10) and specific feedback for each dimension.
Include an overall level (beginner, elementary, intermediate, advanced, expert) and improvement suggestions.`
  }

  private buildEducationalFeedbackPrompt(text: string, skillAssessment: SkillAssessment): string {
    return `Generate positive, constructive educational feedback for a young writer based on their text and skill assessment:

Text: ${text.slice(0, 500)}...
Current Level: ${skillAssessment.overall.level}
Strengths: ${skillAssessment.vocabulary.strengths?.join(', ') || 'N/A'}
Areas for Growth: ${skillAssessment.vocabulary.improvements?.join(', ') || 'N/A'}

Create encouraging feedback that:
- Celebrates specific strengths and achievements
- Offers concrete, actionable improvement suggestions
- Uses age-appropriate language and examples
- Maintains a positive, growth-minded tone
- Provides specific writing exercises or techniques to try

Focus on building confidence while guiding skill development.`
  }

  private parseStoryFromResponse(response: string, request: StoryGenerationRequest): GeneratedStory {
    try {
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          id: this.generateId(),
          title: parsed.title || 'Generated Story',
          description: parsed.description || '',
          synopsis: parsed.synopsis || '',
          chapters: parsed.chapters || [],
          outline: parsed.outline || {},
          characters: request.characters || [],
          metadata: {
            wordCount: this.countWords(response),
            estimatedReadingTime: Math.ceil(this.countWords(response) / 200),
            complexity: 5,
            themes: request.educationalGoals || [],
            contentWarnings: [],
            educationalValue: 7
          },
          generationParams: request,
          generatedAt: new Date(),
          aiModel: 'gemini-1.5-pro',
          processingTime: 0
        }
      }
    } catch (error) {
      console.warn('Failed to parse story JSON, using fallback')
    }

    // Fallback parsing
    return this.createFallbackStory(response, request)
  }

  private parseChapterFromResponse(response: string, context: StoryContext): GeneratedChapter {
    const lines = response.split('\n')
    const title = lines[0]?.replace(/^#+\s*/, '') || `Chapter ${context.currentChapter + 1}`
    const content = lines.slice(1).join('\n').trim()

    return {
      id: this.generateId(),
      chapterNumber: context.currentChapter + 1,
      title,
      content,
      prompt: '',
      wordCount: this.countWords(content),
      mood: 'neutral',
      plotProgression: {
        tensionLevel: 5,
        paceLevel: 5,
        emotionalImpact: 5
      }
    }
  }

  private parseSkillAssessmentFromResponse(response: string): SkillAssessment {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          overall: parsed.overall || { level: 'intermediate', score: 5 },
          vocabulary: parsed.vocabulary || { score: 5, strengths: [], improvements: [] },
          grammar: parsed.grammar || { score: 5, strengths: [], improvements: [] },
          narrative: parsed.narrative || { score: 5, strengths: [], improvements: [] },
          creativity: parsed.creativity || { score: 5, strengths: [], improvements: [] },
          style: parsed.style || { score: 5, strengths: [], improvements: [] },
          generatedAt: new Date()
        }
      }
    } catch (error) {
      console.warn('Failed to parse skill assessment, using default')
    }

    // Return default assessment
    return {
      overall: { level: 'intermediate', score: 5 },
      vocabulary: { score: 5, strengths: ['Good word choice'], improvements: ['Try more varied vocabulary'] },
      grammar: { score: 5, strengths: ['Clear sentences'], improvements: ['Check punctuation'] },
      narrative: { score: 5, strengths: ['Engaging story'], improvements: ['Develop plot structure'] },
      creativity: { score: 5, strengths: ['Creative ideas'], improvements: ['Add more descriptive details'] },
      style: { score: 5, strengths: ['Personal voice'], improvements: ['Vary sentence length'] },
      generatedAt: new Date()
    }
  }

  private parseEducationalFeedbackFromResponse(response: string, assessment: SkillAssessment): EducationalFeedback {
    return {
      id: this.generateId(),
      userId: '',
      overallTone: 'encouraging',
      strengths: [
        'Great creativity in your storytelling!',
        'You have a strong narrative voice.',
        'Excellent character development.'
      ],
      improvements: [
        'Try varying your sentence length for better flow.',
        'Consider adding more descriptive details.',
        'Practice using more varied vocabulary.'
      ],
      exercises: [
        'Write a character description using only dialogue.',
        'Rewrite a paragraph using different sentence structures.',
        'Create a scene using all five senses.'
      ],
      encouragement: response || 'Keep writing and exploring your creativity! Every story you write helps you grow as a writer.',
      nextSteps: [
        'Continue practicing daily writing',
        'Read books in your favorite genre',
        'Try writing from different perspectives'
      ],
      skillProgression: assessment,
      generatedAt: new Date()
    }
  }

  private createFallbackStory(response: string, request: StoryGenerationRequest): GeneratedStory {
    return {
      id: this.generateId(),
      title: 'Generated Story',
      description: 'An AI-generated story based on your prompt',
      synopsis: response.slice(0, 200) + '...',
      chapters: [{
        id: this.generateId(),
        chapterNumber: 1,
        title: 'Chapter 1',
        content: response,
        prompt: '',
        wordCount: this.countWords(response),
        mood: 'neutral',
        plotProgression: {
          tensionLevel: 5,
          paceLevel: 5,
          emotionalImpact: 5
        }
      }],
      outline: {},
      characters: request.characters || [],
      metadata: {
        wordCount: this.countWords(response),
        estimatedReadingTime: Math.ceil(this.countWords(response) / 200),
        complexity: 5,
        themes: [],
        contentWarnings: [],
        educationalValue: 5
      },
      generationParams: request,
      generatedAt: new Date(),
      aiModel: 'gemini-1.5-pro',
      processingTime: 0
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }
}

// Export singleton instance
export const narrativeAIClient = new NarrativeAIServicesClient()