/**
 * @deprecated This service contains functionality that is not supported by the current AI Services backend.
 * The functionality in this file has been documented in MISSING_BACKEND_ENDPOINTS.md
 * Use the definitive AI services client (lib/ai-services-client.ts) instead.
 */

// Commenting out imports that don't exist in the current backend
/*
import { 
  FirebaseCacheManager, 
  VertexAIService,
  AIServicesClient,
  GoogleCloudAuthenticator 
} from 'lore-forge-ai-services'
*/
import { v4 as uuid } from 'uuid'
import type {
  StoryGenerationRequest,
  GeneratedStory,
  GeneratedChapter,
  StoryContext,
  PlotStructure,
  StoryCharacter,
  WorldContext,
  // EnhancedPrompt, // These types don't exist - documented in MISSING_BACKEND_ENDPOINTS.md
  // PlotAnalysis,
  // SkillLevel,
  // AdaptedStory,
  // StoryMetadata
} from '@/types'

// Temporary type definitions to prevent build errors
interface EnhancedPrompt {
  originalPrompt: string;
  enhancedPrompt: string;
  contextElements: string[];
  estimatedComplexity: number;
}

interface PlotAnalysis {
  plotStructure: any;
  characterArcs: any[];
  themes: any[];
  educationalValue: number;
  suggestions: string[];
}

interface AdaptedStory extends GeneratedStory {
  adaptations: Array<{
    type: string;
    description: string;
  }>;
  originalComplexity: number;
  targetComplexity: number;
}

interface StoryMetadata {
  wordCount: number;
  estimatedReadingTime: number;
  complexity: number;
  themes: string[];
  contentWarnings: string[];
  educationalValue: number;
}

type SkillLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';

export class VertexAINarrativeService {
  private cacheManager: any // FirebaseCacheManager - not available in current backend
  private vertexAIService: any // VertexAIService - not available in current backend
  private aiServicesClient: any // AIServicesClient - not available in current backend
  private projectId: string
  private location: string
  private model: string

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT!
    this.location = process.env.VERTEX_AI_LOCATION || 'us-central1'
    this.model = process.env.NARRATIVE_AI_MODEL || 'gemini-1.5-pro'
    
    // Initialize ai-services components - disabled until backend supports them
    console.warn('VertexAINarrativeService is deprecated. Use aiServicesClient instead.')
    /*
    this.cacheManager = FirebaseCacheManager.getInstance()
    const authenticator = new GoogleCloudAuthenticator()
    this.vertexAIService = new VertexAIService(authenticator)
    this.aiServicesClient = new AIServicesClient({
      baseURL: process.env.CLOUD_NARRATIVE_GENERATION_FULLURL || 
               process.env.CLOUD_CHARACTER_CREATION_FULLURL?.replace('character-creator', 'narrative-generator'),
      timeout: 60000
    })
    */
  }

  /**
   * Generate a complete story from a prompt with cross-module integration
   * Uses ai-services caching and Cloud Functions for optimal performance
   */
  async generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    const startTime = Date.now()
    
    try {
      // Generate cache-friendly request key
      const cacheKey = this.generateStoryKey(request)
      
      // Try cache first for complete story
      const cachedStory = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateStory',
        prompt: cacheKey,
        model: this.model,
        options: request
      }, 'CACHE_FIRST')
      
      if (cachedStory?.data) {
        console.log('✅ Story retrieved from cache')
        return { ...cachedStory.data, processingTime: Date.now() - startTime }
      }
      
      // Generate new story with cached components
      console.log('🔄 Generating new story with cached optimization')
      
      // Step 1: Enhance the prompt with context (cached)
      const enhancedPrompt = await this.enhancePromptWithContext(request)
      
      // Step 2: Generate story structure (cached)
      const storyStructure = await this.generateStoryStructure(enhancedPrompt, request)
      
      // Step 3: Generate chapters (batch cached)
      const chapters = await this.generateChaptersBatched(storyStructure, request)
      
      // Step 4: Create metadata
      const metadata = await this.generateStoryMetadata(chapters, request)
      
      const processingTime = Date.now() - startTime
      
      const generatedStory: GeneratedStory = {
        id: uuid(),
        title: storyStructure.title,
        description: storyStructure.description,
        synopsis: storyStructure.synopsis,
        chapters,
        outline: storyStructure.plotStructure,
        characters: request.characters || [],
        metadata,
        generationParams: request,
        generatedAt: new Date(),
        aiModel: this.model,
        processingTime
      }
      
      // Cache the complete story for future requests
      await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateStory',
        prompt: cacheKey,
        model: this.model,
        options: request
      }, 'CACHE_ONLY', generatedStory)
      
      console.log(`✅ Story generated and cached in ${processingTime}ms`)
      return generatedStory
      
    } catch (error) {
      console.error('Story generation failed:', error)
      
      // Try Cloud Functions fallback if available
      if (process.env.CLOUD_NARRATIVE_GENERATION_FULLURL) {
        try {
          console.log('🔄 Attempting Cloud Functions fallback...')
          return await this.generateStoryViaCloudFunction(request)
        } catch (cloudError) {
          console.error('Cloud Functions fallback failed:', cloudError)
        }
      }
      
      throw new Error(`Failed to generate story: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate the next chapter in an ongoing story
   * Uses ai-services caching for plot progression and chapter content
   */
  async generateNextChapter(context: StoryContext): Promise<GeneratedChapter> {
    try {
      // Generate cache key for chapter context
      const contextKey = this.generateChapterContextKey(context)
      
      // Try to get cached chapter first
      const cachedChapter = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateChapter',
        prompt: contextKey,
        model: this.model,
        options: { temperature: 0.8, max_output_tokens: 2048 }
      }, 'CACHE_FIRST')
      
      if (cachedChapter?.data) {
        console.log('✅ Chapter retrieved from cache')
        return cachedChapter.data
      }
      
      console.log('🔄 Generating new chapter...')
      
      // Get plot progression (cached)
      const plotProgression = await this.analyzePlotProgressionCached(context)
      const chapterPrompt = await this.buildChapterPrompt(context, plotProgression)
      
      // Generate chapter using ai-services
      const result = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateText',
        prompt: chapterPrompt,
        model: this.model,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          top_k: 40,
          max_output_tokens: 2048
        }
      }, 'CACHE_FIRST')
      
      const chapterText = result?.data?.text || result?.data || ''
      
      if (!chapterText) {
        throw new Error('No chapter content generated')
      }

      // Parse and structure the chapter
      const chapter = await this.parseGeneratedChapter(chapterText, context)
      
      // Cache the generated chapter
      await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'generateChapter',
        prompt: contextKey,
        model: this.model,
        options: { temperature: 0.8, max_output_tokens: 2048 }
      }, 'CACHE_ONLY', chapter)
      
      return chapter
      
    } catch (error) {
      console.error('Chapter generation failed:', error)
      throw new Error(`Failed to generate chapter: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Enhance a basic prompt with character and world context
   * Uses cross-module cached data from RPG and World Builder
   */
  async enhancePromptWithContext(request: StoryGenerationRequest): Promise<EnhancedPrompt> {
    const enhancementKey = this.generateEnhancementKey(request)
    
    // Try to get cached enhanced prompt
    const cachedEnhancement = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'enhancePrompt',
      prompt: enhancementKey,
      model: 'cache-only'
    }, 'CACHE_FIRST')
    
    if (cachedEnhancement?.data) {
      console.log('✅ Enhanced prompt retrieved from cache')
      return cachedEnhancement.data
    }
    
    console.log('🔄 Enhancing prompt with cross-module data...')
    
    let enhancedPrompt = request.initialPrompt
    const contextElements: string[] = []

    // Add character context if characters are imported (cached from RPG)
    if (request.characters && request.characters.length > 0) {
      const characterContext = await this.buildCharacterContextCached(request.characters)
      enhancedPrompt += `\n\nCharacters to include:\n${characterContext}`
      contextElements.push('characters')
    }

    // Add world context if world is selected (cached from World Builder)
    if (request.worldContext) {
      const worldContext = await this.buildWorldContextCached(request.worldContext)
      enhancedPrompt += `\n\nWorld setting:\n${worldContext}`
      contextElements.push('world')
    }

    // Add genre-specific guidance (cached)
    const genreGuidance = await this.getGenreGuidanceCached(request.genre)
    enhancedPrompt += `\n\nGenre guidelines:\n${genreGuidance}`

    // Add educational requirements (if enabled)
    if (request.skillTargets && request.skillTargets.length > 0) {
      const educationalContext = await this.buildEducationalContextCached(request.skillTargets, request.targetAudience)
      enhancedPrompt += `\n\nEducational objectives:\n${educationalContext}`
      contextElements.push('educational')
    }

    const enhancement: EnhancedPrompt = {
      originalPrompt: request.initialPrompt,
      enhancedPrompt,
      contextElements,
      estimatedComplexity: this.estimateComplexity(enhancedPrompt, request.targetAudience)
    }
    
    // Cache the enhanced prompt
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'enhancePrompt',
      prompt: enhancementKey,
      model: 'cache-only'
    }, 'CACHE_ONLY', enhancement)
    
    return enhancement
  }

  /**
   * Analyze story structure for educational feedback
   * Uses ai-services caching for analysis results
   */
  async analyzeStoryStructure(story: string): Promise<PlotAnalysis> {
    try {
      const storyHash = this.generateStoryHash(story)
      
      // Try to get cached analysis
      const cachedAnalysis = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'analyzeStory',
        prompt: storyHash,
        model: this.model,
        options: { temperature: 0.3, max_output_tokens: 1024 }
      }, 'CACHE_FIRST')
      
      if (cachedAnalysis?.data) {
        console.log('✅ Story analysis retrieved from cache')
        return cachedAnalysis.data
      }
      
      console.log('🔄 Analyzing story structure...')
      
      const analysisPrompt = this.buildAnalysisPrompt(story)
      
      // Use ai-services for analysis
      const result = await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'analyzeText',
        prompt: analysisPrompt,
        model: this.model,
        options: {
          temperature: 0.3,
          max_output_tokens: 1024
        }
      }, 'CACHE_FIRST')

      const response = result?.data?.text || result?.data || ''
      const analysis = this.parseAnalysisResponse(response)
      
      // Cache the analysis
      await this.cacheManager.executeRequest({
        service: 'narrative',
        operation: 'analyzeStory',
        prompt: storyHash,
        model: this.model,
        options: { temperature: 0.3, max_output_tokens: 1024 }
      }, 'CACHE_ONLY', analysis)
      
      return analysis
      
    } catch (error) {
      console.error('Story analysis failed:', error)
      throw new Error(`Failed to analyze story: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Adapt story complexity for different skill levels
   */
  async adaptStoryComplexity(
    story: GeneratedStory,
    targetLevel: SkillLevel
  ): Promise<AdaptedStory> {
    try {
      const currentComplexity = story.metadata.complexity
      const targetComplexity = this.getTargetComplexity(targetLevel)

      if (Math.abs(currentComplexity - targetComplexity) < 0.5) {
        // No adaptation needed
        return {
          ...story,
          adaptations: [],
          originalComplexity: currentComplexity,
          targetComplexity
        }
      }

      const adaptations = []

      if (currentComplexity > targetComplexity) {
        // Simplify the story
        const simplifiedChapters = await Promise.all(
          story.chapters.map(chapter => this.simplifyChapter(chapter, targetComplexity))
        )
        story.chapters = simplifiedChapters
        adaptations.push({
          type: 'simplification',
          description: 'Reduced vocabulary and sentence complexity'
        })
      } else {
        // Add complexity to the story
        const enhancedChapters = await Promise.all(
          story.chapters.map(chapter => this.enhanceChapter(chapter, targetComplexity))
        )
        story.chapters = enhancedChapters
        adaptations.push({
          type: 'enhancement',
          description: 'Added vocabulary and narrative complexity'
        })
      }

      return {
        ...story,
        adaptations,
        originalComplexity: currentComplexity,
        targetComplexity
      }
    } catch (error) {
      console.error('Story adaptation failed:', error)
      throw new Error(`Failed to adapt story: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // New ai-services integration helper methods
  
  private generateStoryKey(request: StoryGenerationRequest): string {
    const elements = [
      request.initialPrompt.slice(0, 100),
      request.genre,
      request.targetAudience,
      request.length,
      request.characters?.map(c => c.name).join(',') || 'no-chars',
      request.worldContext?.name || 'no-world'
    ]
    return `story:${elements.join(':')}`
  }
  
  private generateChapterContextKey(context: StoryContext): string {
    return `chapter:${context.storyId}:${context.currentChapter}:${context.narrative.slice(-200)}`
  }
  
  private generateEnhancementKey(request: StoryGenerationRequest): string {
    return `enhance:${request.initialPrompt.slice(0, 50)}:${request.genre}:${request.targetAudience}`
  }
  
  private generateStoryHash(story: string): string {
    // Simple hash for caching story analysis
    return `analysis:${story.slice(0, 100)}:${story.length}`
  }
  
  private async generateStoryViaCloudFunction(request: StoryGenerationRequest): Promise<GeneratedStory> {
    try {
      const response = await this.aiServicesClient.post('/narrative/generate-story', {
        ...request,
        model: this.model
      })
      
      return response.data
    } catch (error) {
      throw new Error(`Cloud Functions story generation failed: ${error}`)
    }
  }
  
  private async generateChaptersBatched(structure: any, request: StoryGenerationRequest): Promise<GeneratedChapter[]> {
    const chapters: GeneratedChapter[] = []
    const chapterCount = request.chapterCount || structure.chapterOutlines.length
    const batchSize = 3 // Process 3 chapters at a time
    
    for (let i = 0; i < chapterCount; i += batchSize) {
      const batch = []
      const end = Math.min(i + batchSize, chapterCount)
      
      for (let j = i; j < end; j++) {
        const chapterOutline = structure.chapterOutlines[j]
        batch.push(this.generateSingleChapterCached(chapterOutline, structure, request, j + 1))
      }
      
      const batchResults = await Promise.all(batch)
      chapters.push(...batchResults)
      
      console.log(`✅ Generated chapters ${i + 1}-${end} of ${chapterCount}`)
    }
    
    return chapters
  }
  
  private async generateSingleChapterCached(
    outline: any,
    structure: any,
    request: StoryGenerationRequest,
    chapterNumber: number
  ): Promise<GeneratedChapter> {
    const chapterKey = `chapter:${structure.title}:${chapterNumber}:${outline.title}`
    
    // Try cache first
    const cachedChapter = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'generateSingleChapter',
      prompt: chapterKey,
      model: this.model,
      options: outline
    }, 'CACHE_FIRST')
    
    if (cachedChapter?.data) {
      return cachedChapter.data
    }
    
    // Generate new chapter
    const chapterPrompt = this.buildSingleChapterPrompt(outline, structure, request, chapterNumber)
    
    const result = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'generateText',
      prompt: chapterPrompt,
      model: this.model,
      options: {
        temperature: 0.8,
        max_output_tokens: 2048
      }
    }, 'CACHE_FIRST')
    
    const response = result?.data?.text || result?.data || ''
    
    const chapter: GeneratedChapter = {
      id: uuid(),
      chapterNumber,
      title: outline.title,
      content: response,
      prompt: chapterPrompt,
      wordCount: this.countWords(response),
      mood: outline.mood || 'neutral',
      plotProgression: {
        events: ['Chapter progression'],
        significance: outline.tensionLevel || 5,
        tension: outline.paceLevel || 5
      }
    }
    
    // Cache the chapter
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'generateSingleChapter',
      prompt: chapterKey,
      model: this.model,
      options: outline
    }, 'CACHE_ONLY', chapter)
    
    return chapter
  }
  
  private async buildCharacterContextCached(characters: StoryCharacter[]): Promise<string> {
    const characterKey = `chars:${characters.map(c => c.name).join(',')}`
    
    const cached = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'buildCharacterContext',
      prompt: characterKey,
      model: 'cache-only'
    }, 'CACHE_FIRST')
    
    if (cached?.data) {
      return cached.data
    }
    
    const context = this.buildCharacterContext(characters)
    
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'buildCharacterContext',
      prompt: characterKey,
      model: 'cache-only'
    }, 'CACHE_ONLY', context)
    
    return context
  }
  
  private async buildWorldContextCached(world: WorldContext): Promise<string> {
    const worldKey = `world:${world.name}:${world.genre}`
    
    const cached = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'buildWorldContext',
      prompt: worldKey,
      model: 'cache-only'
    }, 'CACHE_FIRST')
    
    if (cached?.data) {
      return cached.data
    }
    
    const context = this.buildWorldContext(world)
    
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'buildWorldContext',
      prompt: worldKey,
      model: 'cache-only'
    }, 'CACHE_ONLY', context)
    
    return context
  }
  
  private async getGenreGuidanceCached(genre: string): Promise<string> {
    const genreKey = `genre:${genre}`
    
    const cached = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'getGenreGuidance',
      prompt: genreKey,
      model: 'cache-only'
    }, 'CACHE_FIRST')
    
    if (cached?.data) {
      return cached.data
    }
    
    const guidance = this.getGenreGuidance(genre)
    
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'getGenreGuidance',
      prompt: genreKey,
      model: 'cache-only'
    }, 'CACHE_ONLY', guidance)
    
    return guidance
  }
  
  private async buildEducationalContextCached(skillTargets: any[], audience: string): Promise<string> {
    const eduKey = `edu:${skillTargets.map(s => s.skill).join(',')}:${audience}`
    
    const cached = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'buildEducationalContext',
      prompt: eduKey,
      model: 'cache-only'
    }, 'CACHE_FIRST')
    
    if (cached?.data) {
      return cached.data
    }
    
    const context = this.buildEducationalContext(skillTargets, audience)
    
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'buildEducationalContext',
      prompt: eduKey,
      model: 'cache-only'
    }, 'CACHE_ONLY', context)
    
    return context
  }
  
  private async analyzePlotProgressionCached(context: StoryContext): Promise<any> {
    const progressKey = `progress:${context.storyId}:${context.currentChapter}`
    
    const cached = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'analyzePlotProgression',
      prompt: progressKey,
      model: 'cache-only'
    }, 'CACHE_FIRST')
    
    if (cached?.data) {
      return cached.data
    }
    
    const progression = await this.analyzePlotProgression(context)
    
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'analyzePlotProgression',
      prompt: progressKey,
      model: 'cache-only'
    }, 'CACHE_ONLY', progression)
    
    return progression
  }

  // Private helper methods

  private async generateStoryStructure(enhancedPrompt: EnhancedPrompt, request: StoryGenerationRequest) {
    const structureKey = `structure:${enhancedPrompt.enhancedPrompt.slice(0, 100)}:${request.genre}`
    
    // Try cache first
    const cachedStructure = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'generateStructure',
      prompt: structureKey,
      model: this.model,
      options: request
    }, 'CACHE_FIRST')
    
    if (cachedStructure?.data) {
      console.log('✅ Story structure retrieved from cache')
      return cachedStructure.data
    }
    
    console.log('🔄 Generating story structure...')
    
    const structurePrompt = this.buildStructurePrompt(enhancedPrompt, request)
    
    const result = await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'generateText',
      prompt: structurePrompt,
      model: this.model,
      options: {
        temperature: 0.7,
        max_output_tokens: 1536
      }
    }, 'CACHE_FIRST')

    const response = result?.data?.text || result?.data || ''
    const structure = this.parseStructureResponse(response, request)
    
    // Cache the structure
    await this.cacheManager.executeRequest({
      service: 'narrative',
      operation: 'generateStructure',
      prompt: structureKey,
      model: this.model,
      options: request
    }, 'CACHE_ONLY', structure)
    
    return structure
  }

  // This method is now replaced by generateChaptersBatched
  private async generateChapters(structure: any, request: StoryGenerationRequest): Promise<GeneratedChapter[]> {
    return this.generateChaptersBatched(structure, request)
  }

  // This method is now replaced by generateSingleChapterCached
  private async generateSingleChapter(
    outline: any,
    structure: any,
    request: StoryGenerationRequest,
    chapterNumber: number
  ): Promise<GeneratedChapter> {
    return this.generateSingleChapterCached(outline, structure, request, chapterNumber)
  }

  private buildCharacterContext(characters: StoryCharacter[]): string {
    return characters.map(char => 
      `- ${char.name}: ${char.description}. Personality: ${char.personality.traits.join(', ')}. Role: ${char.narrativeRole}`
    ).join('\n')
  }

  private buildWorldContext(world: WorldContext): string {
    return `World: ${world.name} - ${world.description}
Genre: ${world.genre}
Key locations: ${world.locations.slice(0, 3).map(l => l.name).join(', ')}
Cultural elements: ${world.lore.cultures.map(c => c.name).join(', ')}`
  }

  private buildEducationalContext(skillTargets: any[], audience: string): string {
    return `Target skills: ${skillTargets.map(s => s.skill).join(', ')}
Age group: ${audience}
Educational goals: ${skillTargets.map(s => s.goal).join(', ')}`
  }

  private getGenreGuidance(genre: string): string {
    const guidelines = {
      fantasy: 'Include magical elements, mythical creatures, and heroic journeys while maintaining age-appropriate content.',
      'science-fiction': 'Incorporate scientific concepts, future technology, and space exploration in an accessible way.',
      mystery: 'Create engaging puzzles with logical solutions and clear clues for young readers.',
      adventure: 'Focus on exciting journeys, problem-solving, and character growth through challenges.',
      historical: 'Accurately portray historical periods while making them relatable to modern young readers.'
    }
    
    return guidelines[genre as keyof typeof guidelines] || 'Create an engaging story appropriate for the target audience.'
  }

  private estimateComplexity(prompt: string, audience: string): number {
    // Basic complexity estimation based on prompt length and audience
    const baseComplexity = {
      'child': 3,
      'preteen': 5,
      'teen': 7,
      'young-adult': 8,
      'adult': 9
    }
    
    return baseComplexity[audience as keyof typeof baseComplexity] || 5
  }

  private getTargetComplexity(skillLevel: SkillLevel): number {
    const complexityMap = {
      'beginner': 3,
      'elementary': 4,
      'intermediate': 6,
      'advanced': 8,
      'expert': 9
    }
    
    return complexityMap[skillLevel] || 5
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  // Placeholder methods - these would contain the full implementation
  private buildStructurePrompt(enhancedPrompt: EnhancedPrompt, request: StoryGenerationRequest): string {
    return `Create a detailed story structure for: ${enhancedPrompt.enhancedPrompt}
    
    Requirements:
    - Genre: ${request.genre}
    - Target audience: ${request.targetAudience}
    - Length: ${request.length}
    - Include chapter outlines
    - Provide character development arcs
    - Ensure age-appropriate themes
    
    Format the response as JSON with title, description, synopsis, plotStructure, and chapterOutlines.`
  }

  private parseStructureResponse(response: string, request: StoryGenerationRequest): any {
    try {
      // Extract JSON from response if wrapped in markdown or text
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      // Fallback parsing logic would go here
      return this.createFallbackStructure(request)
    } catch {
      return this.createFallbackStructure(request)
    }
  }

  private createFallbackStructure(request: StoryGenerationRequest): any {
    return {
      title: 'Generated Story',
      description: 'An AI-generated story',
      synopsis: 'A story created from the provided prompt',
      chapterOutlines: [
        { title: 'Chapter 1', outline: 'Story beginning', mood: 'hopeful' }
      ]
    }
  }

  private buildSingleChapterPrompt(outline: any, structure: any, request: StoryGenerationRequest, chapterNumber: number): string {
    return `Write Chapter ${chapterNumber}: ${outline.title}

Story context: ${structure.description}
Chapter outline: ${outline.outline}
Mood: ${outline.mood}
Target audience: ${request.targetAudience}

Write a complete chapter (800-1200 words) that:
- Advances the plot according to the outline
- Maintains consistent character voices
- Is appropriate for ${request.targetAudience} readers
- Has engaging dialogue and description`
  }

  private async parseGeneratedChapter(text: string, context: StoryContext): Promise<GeneratedChapter> {
    // Parse the generated chapter text and extract structured information
    const lines = text.split('\n')
    const title = lines[0]?.replace(/^#+\s*/, '') || `Chapter ${context.currentChapter + 1}`
    const content = lines.slice(1).join('\n').trim()

    return {
      id: uuid(),
      chapterNumber: context.currentChapter + 1,
      title,
      content,
      prompt: '',
      wordCount: this.countWords(content),
      mood: 'neutral',
      plotProgression: {
        events: ['Chapter progression'],
        significance: 5,
        tension: 5
      }
    }
  }

  private async analyzePlotProgression(context: StoryContext): Promise<any> {
    // Analyze the current story progression to determine next chapter direction
    return {
      currentTension: 5,
      suggestedPacing: 'moderate',
      nextPlotPoint: 'character development',
      recommendedLength: 1000
    }
  }

  private buildChapterPrompt(context: StoryContext, progression: any): string {
    return `Continue the story based on the following context:

Previous narrative: ${context.narrative.slice(-1000)}
Current characters: ${context.characters.map(c => c.name).join(', ')}
Plot progression: ${progression.nextPlotPoint}
Target tension level: ${progression.currentTension}

Write the next chapter (800-1200 words) that continues the story naturally.`
  }

  private buildAnalysisPrompt(story: string): string {
    return `Analyze the following story for plot structure, character development, and educational value:

${story.slice(0, 2000)}...

Provide analysis in JSON format including:
- plotStructure (exposition, rising action, climax, resolution)
- characterArcs
- themes
- educationalValue
- suggestedImprovements`
  }

  private parseAnalysisResponse(response: string): PlotAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          plotStructure: parsed.plotStructure || {},
          characterArcs: parsed.characterArcs || [],
          themes: parsed.themes || [],
          educationalValue: parsed.educationalValue || 0,
          suggestions: parsed.suggestedImprovements || []
        }
      }
    } catch (error) {
      console.warn('Failed to parse analysis response:', error)
    }

    // Return default analysis
    return {
      plotStructure: { act1: '', act2: '', act3: '' },
      characterArcs: [],
      themes: [],
      educationalValue: 5,
      suggestions: []
    }
  }

  private async simplifyChapter(chapter: GeneratedChapter, targetComplexity: number): Promise<GeneratedChapter> {
    // Implement chapter simplification logic
    return chapter
  }

  private async enhanceChapter(chapter: GeneratedChapter, targetComplexity: number): Promise<GeneratedChapter> {
    // Implement chapter enhancement logic
    return chapter
  }

  private async generateStoryMetadata(chapters: GeneratedChapter[], request: StoryGenerationRequest): Promise<StoryMetadata> {
    const totalWordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
    const estimatedReadingTime = Math.ceil(totalWordCount / 200) // 200 words per minute average

    return {
      wordCount: totalWordCount,
      estimatedReadingTime,
      complexity: this.estimateComplexity('', request.targetAudience),
      themes: request.educationalGoals || [],
      contentWarnings: [],
      educationalValue: 7
    }
  }
}

// Additional type definitions needed for this service
interface EnhancedPrompt {
  originalPrompt: string
  enhancedPrompt: string
  contextElements: string[]
  estimatedComplexity: number
}

interface PlotAnalysis {
  plotStructure: any
  characterArcs: any[]
  themes: any[]
  educationalValue: number
  suggestions: string[]
}

interface AdaptedStory extends GeneratedStory {
  adaptations: Array<{
    type: string
    description: string
  }>
  originalComplexity: number
  targetComplexity: number
}