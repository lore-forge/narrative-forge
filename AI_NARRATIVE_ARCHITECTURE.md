# 🤖 AI Narrative Architecture

## Overview

The AI Narrative Architecture is the core intelligence system powering Narrative Forge's story generation capabilities. It extends the existing `lore-forge-ai-services` library with specialized narrative AI services, creating the 5th specialized agent in the Lore Forge ecosystem.

## 🎭 The 5th AI Agent: "Narrative Weaver"

### Agent Profile
- **Name**: Narrative Weaver
- **Specialization**: Advanced story generation, plot analysis, and narrative continuity
- **Integration**: Extends the existing 4-agent system from RPG Immersive
- **Unique Features**: Cross-modal storytelling, character consistency, world integration

### Agent Capabilities
```typescript
interface NarrativeWeaverCapabilities {
  storyGeneration: {
    promptExpansion: boolean;
    chapterGeneration: boolean;
    plotStructureAnalysis: boolean;
    characterArcDevelopment: boolean;
    worldConsistencyMaintenance: boolean;
  };
  
  crossModuleIntegration: {
    characterImport: boolean;
    worldIntegration: boolean;
    adventureAdaptation: boolean;
    realTimeSync: boolean;
  };
  
  multimodalOutput: {
    textGeneration: boolean;
    imagePromptEnhancement: boolean;
    audioScriptGeneration: boolean;
    interactiveElements: boolean;
  };
  
  educationalFeatures: {
    writingAnalysis: boolean;
    skillAssessment: boolean;
    progressTracking: boolean;
    adaptiveComplexity: boolean;
  };
}
```

## 🏗️ Technical Architecture

### Core AI Service Extension

```typescript
// lib/ai/vertex-ai-narrative-service.ts
export class VertexAINarrativeService extends BaseAIService {
  private promptTemplates: NarrativePromptTemplates;
  private storyMemory: StoryMemoryManager;
  private consistencyChecker: ConsistencyChecker;
  private styleProcessor: StyleProcessor;

  constructor(authenticator: GoogleCloudAuthenticator) {
    super(authenticator);
    this.promptTemplates = new NarrativePromptTemplates();
    this.storyMemory = new StoryMemoryManager();
    this.consistencyChecker = new ConsistencyChecker();
    this.styleProcessor = new StyleProcessor();
  }

  // Primary story generation method
  async generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    const validatedRequest = await this.validateRequest(request);
    const enhancedPrompt = await this.enhancePrompt(validatedRequest);
    const storyStructure = await this.generateStoryStructure(enhancedPrompt);
    const chapters = await this.generateChapters(storyStructure);
    const postProcessedStory = await this.postProcessStory(chapters, validatedRequest);
    
    return postProcessedStory;
  }

  // Incremental chapter generation for long-form content
  async generateNextChapter(context: StoryContext): Promise<GeneratedChapter> {
    const storyMemory = await this.storyMemory.getContext(context.storyId);
    const plotProgression = await this.analyzePlotProgression(storyMemory);
    const chapterPrompt = await this.buildChapterPrompt(context, plotProgression);
    
    const chapter = await this.generateSingleChapter(chapterPrompt);
    await this.updateStoryMemory(context.storyId, chapter);
    
    return chapter;
  }

  // Advanced prompt enhancement with multi-modal context
  async enhancePrompt(request: StoryGenerationRequest): Promise<EnhancedPrompt> {
    let prompt = request.initialPrompt;
    
    // Character context integration
    if (request.characters?.length > 0) {
      const characterContext = await this.buildCharacterContext(request.characters);
      prompt = await this.integrateCharacterContext(prompt, characterContext);
    }
    
    // World context integration
    if (request.worldContext) {
      const worldPrompt = await this.buildWorldContext(request.worldContext);
      prompt = await this.integrateWorldContext(prompt, worldPrompt);
    }
    
    // Genre and style enhancement
    const genreEnhancement = await this.applyGenreSpecification(prompt, request.genre);
    const styleEnhancement = await this.applyStyleGuidelines(genreEnhancement, request.style);
    
    return {
      originalPrompt: request.initialPrompt,
      enhancedPrompt: styleEnhancement,
      contextElements: this.extractContextElements(request),
      estimatedComplexity: await this.estimateComplexity(styleEnhancement)
    };
  }
}
```

### Advanced Prompt Engineering

```typescript
// lib/ai/narrative-prompt-templates.ts
export class NarrativePromptTemplates {
  
  async buildStoryGenerationPrompt(request: EnhancedStoryRequest): Promise<string> {
    const baseTemplate = this.getBaseStoryTemplate(request.genre);
    const characterSection = await this.buildCharacterSection(request.characters);
    const worldSection = await this.buildWorldSection(request.worldContext);
    const structureSection = this.buildStructureSection(request.structure);
    const styleSection = this.buildStyleSection(request.style);
    
    return `
${baseTemplate}

STORY GENERATION REQUEST:
Initial Concept: ${request.enhancedPrompt}

${characterSection}

${worldSection}

STORY STRUCTURE:
${structureSection}

WRITING STYLE AND TONE:
${styleSection}

TARGET AUDIENCE: ${request.targetAudience}
- Age Range: ${this.getAgeRange(request.targetAudience)}
- Reading Level: ${this.getReadingLevel(request.targetAudience)}
- Content Guidelines: ${this.getContentGuidelines(request.targetAudience)}

TECHNICAL REQUIREMENTS:
- Length: ${request.length} (approximately ${this.estimateWordCount(request.length)} words)
- Chapters: ${request.chapterCount || 'Auto-determine based on length'}
- Perspective: ${request.perspective || 'Third person limited'}
- Tense: ${request.tense || 'Past tense'}

INTEGRATION REQUIREMENTS:
${request.characters ? '- Maintain character consistency with imported personalities' : ''}
${request.worldContext ? '- Adhere to established world lore and rules' : ''}
- Ensure age-appropriate content and themes
- Include opportunities for character growth and development
- Create engaging plot progression with appropriate pacing

OUTPUT FORMAT:
Please provide:
1. Story Title and Brief Synopsis
2. Chapter-by-chapter outline
3. Full story text with clear chapter divisions
4. Character development notes
5. Thematic elements and moral lessons (if appropriate for age group)

Begin story generation:
    `;
  }

  private getBaseStoryTemplate(genre: Genre): string {
    const templates = {
      fantasy: `
You are an expert fantasy storyteller specializing in creating engaging, age-appropriate fantasy adventures. Your stories should include:
- Rich world-building with magical elements
- Clear hero's journey structure
- Diverse characters with distinct personalities
- Moral lessons appropriate for young readers
- Exciting but not overly violent conflicts
      `,
      
      'science-fiction': `
You are a skilled science fiction author creating educational and inspiring sci-fi stories. Your narratives should feature:
- Scientifically plausible concepts explained accessibly
- Exploration of technology's impact on society
- Diverse representation in future settings
- Problem-solving through science and cooperation
- Ethical considerations of technological advancement
      `,
      
      mystery: `
You are a mystery writer crafting engaging puzzles for young readers. Your stories should include:
- Age-appropriate mysteries with logical solutions
- Clear clues that readers can follow
- Diverse characters working together
- Problem-solving through observation and deduction
- Positive resolution without frightening content
      `,
      
      adventure: `
You are an adventure storyteller creating exciting journeys for young readers. Your stories should feature:
- Exciting but safe adventures
- Teamwork and friendship themes
- Diverse characters with unique skills
- Problem-solving through creativity and cooperation
- Positive messages about perseverance and courage
      `,
      
      historical: `
You are a historical fiction author bringing the past to life for young readers. Your stories should include:
- Accurate historical details presented accessibly
- Diverse perspectives from historical periods
- Educational elements woven naturally into narrative
- Age-appropriate handling of historical conflicts
- Inspiring examples of human resilience and progress
      `
    };
    
    return templates[genre] || templates.fantasy;
  }

  async buildCharacterSection(characters: StoryCharacter[]): Promise<string> {
    if (!characters || characters.length === 0) {
      return '- No pre-existing characters specified. Create original characters as needed.';
    }

    const characterDescriptions = await Promise.all(
      characters.map(async char => {
        const personalityAnalysis = await this.analyzeCharacterPersonality(char);
        const narrativeRole = await this.determineNarrativeRole(char);
        
        return `
CHARACTER: ${char.name}
- Background: ${char.background}
- Personality Traits: ${char.personality.traits.join(', ')}
- Motivations: ${char.personality.motivations.join(', ')}
- Narrative Role: ${narrativeRole}
- Dialogue Style: ${char.dialogueStyle || 'Determined by personality'}
- Character Arc Potential: ${personalityAnalysis.growthAreas.join(', ')}
${char.sourceModule === 'rpg-immersive' ? '- Source: Imported from RPG campaign' : ''}
        `;
      })
    );

    return `
EXISTING CHARACTERS TO INTEGRATE:
${characterDescriptions.join('\n')}

CHARACTER INTEGRATION GUIDELINES:
- Maintain consistency with established personalities
- Show character growth and development throughout the story
- Ensure each character has meaningful contributions to the plot
- Balance dialogue to reflect individual character voices
- Create realistic relationships and interactions between characters
    `;
  }

  async buildWorldSection(worldContext: WorldContext): Promise<string> {
    if (!worldContext) {
      return '- No pre-existing world specified. Create original world setting as needed.';
    }

    return `
WORLD SETTING: ${worldContext.name}
- Genre: ${worldContext.genre}
- Description: ${worldContext.description}

KEY LOCATIONS:
${worldContext.locations.slice(0, 5).map(loc => 
  `- ${loc.name}: ${loc.description} (${loc.type})`
).join('\n')}

WORLD LORE:
- Historical Context: ${worldContext.lore.history.slice(0, 3).map(h => h.event).join(', ')}
- Cultures: ${worldContext.lore.cultures.map(c => c.name).join(', ')}
- Important NPCs: ${worldContext.npcs.slice(0, 5).map(npc => `${npc.name} (${npc.role})`).join(', ')}

WORLD CONSISTENCY REQUIREMENTS:
- Adhere to established world rules and physics
- Maintain consistency with existing lore and timeline
- Utilize established locations and NPCs where appropriate
- Respect cultural elements and avoid stereotypes
- Ensure story events fit within world's established history
    `;
  }
}
```

### Story Memory and Consistency Management

```typescript
// lib/ai/story-memory-manager.ts
export class StoryMemoryManager {
  private memoryStore: Map<string, StoryMemory> = new Map();
  private consistencyRules: ConsistencyRule[];
  private contextWindow: number = 10000; // tokens

  async getContext(storyId: string): Promise<StoryContext> {
    const memory = this.memoryStore.get(storyId);
    if (!memory) {
      return this.initializeStoryMemory(storyId);
    }

    return {
      storyId,
      characters: memory.characters,
      plotEvents: memory.plotEvents,
      worldElements: memory.worldElements,
      continuity: memory.continuity,
      currentChapter: memory.currentChapter,
      narrative: memory.narrative.slice(-this.contextWindow)
    };
  }

  async updateStoryMemory(storyId: string, newChapter: GeneratedChapter): Promise<void> {
    let memory = this.memoryStore.get(storyId);
    if (!memory) {
      memory = await this.initializeStoryMemory(storyId);
    }

    // Extract new plot events
    const plotEvents = await this.extractPlotEvents(newChapter.content);
    memory.plotEvents.push(...plotEvents);

    // Update character information
    const characterUpdates = await this.extractCharacterUpdates(newChapter.content);
    this.updateCharacterMemory(memory.characters, characterUpdates);

    // Track world elements
    const worldElements = await this.extractWorldElements(newChapter.content);
    memory.worldElements.push(...worldElements);

    // Update narrative context
    memory.narrative += `\n\nChapter ${newChapter.chapterNumber}: ${newChapter.title}\n${newChapter.content}`;
    
    // Maintain context window
    if (memory.narrative.length > this.contextWindow) {
      memory.narrative = memory.narrative.slice(-this.contextWindow);
    }

    memory.currentChapter = newChapter.chapterNumber;
    memory.lastUpdated = new Date();

    this.memoryStore.set(storyId, memory);
  }

  async validateConsistency(storyId: string, newContent: string): Promise<ConsistencyReport> {
    const memory = this.memoryStore.get(storyId);
    if (!memory) return { isConsistent: true, issues: [] };

    const issues: ConsistencyIssue[] = [];

    // Character consistency check
    const characterIssues = await this.checkCharacterConsistency(memory.characters, newContent);
    issues.push(...characterIssues);

    // Plot consistency check
    const plotIssues = await this.checkPlotConsistency(memory.plotEvents, newContent);
    issues.push(...plotIssues);

    // World consistency check
    const worldIssues = await this.checkWorldConsistency(memory.worldElements, newContent);
    issues.push(...worldIssues);

    return {
      isConsistent: issues.length === 0,
      issues: issues,
      suggestions: await this.generateConsistencySuggestions(issues)
    };
  }

  private async extractPlotEvents(content: string): Promise<PlotEvent[]> {
    const aiAnalysis = await this.aiService.analyzeText(content, 'plot-events');
    
    return aiAnalysis.events.map(event => ({
      id: uuid(),
      description: event.description,
      type: event.type, // conflict, resolution, revelation, etc.
      characters: event.involvedCharacters,
      location: event.location,
      significance: event.significance,
      timestamp: new Date()
    }));
  }

  private async extractCharacterUpdates(content: string): Promise<CharacterUpdate[]> {
    const aiAnalysis = await this.aiService.analyzeText(content, 'character-development');
    
    return aiAnalysis.updates.map(update => ({
      characterId: update.characterId,
      traits: update.newTraits,
      relationships: update.relationshipChanges,
      growth: update.developmentAreas,
      dialogue: update.dialogueExamples
    }));
  }
}
```

### Multi-Modal Content Generation

```typescript
// lib/ai/multimedia-narrative-service.ts
export class MultimediaNarrativeService {
  private imageService: RPGAICharImgServices;
  private audioService: VoiceCharacterService;
  private narrativeService: VertexAINarrativeService;

  async generateMultimediaChapter(
    chapter: GeneratedChapter,
    storyContext: StoryContext,
    options: MultimediaOptions
  ): Promise<MultimediaChapter> {
    
    const multimediaElements: MultimediaElement[] = [];

    // Generate scene images
    if (options.includeImages) {
      const sceneImages = await this.generateSceneImages(chapter, storyContext);
      multimediaElements.push(...sceneImages);
    }

    // Generate character portraits for dialogue scenes
    if (options.includeCharacterImages) {
      const characterImages = await this.generateCharacterImages(chapter, storyContext);
      multimediaElements.push(...characterImages);
    }

    // Generate audio narration
    if (options.includeAudio) {
      const audioNarration = await this.generateAudioNarration(chapter, storyContext);
      multimediaElements.push(audioNarration);
    }

    // Generate interactive elements
    if (options.includeInteractive) {
      const interactiveElements = await this.generateInteractiveElements(chapter);
      multimediaElements.push(...interactiveElements);
    }

    return {
      ...chapter,
      multimedia: multimediaElements,
      interactivity: options.includeInteractive ? await this.generateChoicePoints(chapter) : [],
      accessibility: await this.generateAccessibilityFeatures(chapter)
    };
  }

  private async generateSceneImages(
    chapter: GeneratedChapter,
    context: StoryContext
  ): Promise<SceneImage[]> {
    
    const scenes = await this.extractScenes(chapter.content);
    const images: SceneImage[] = [];

    for (const scene of scenes.slice(0, 3)) { // Limit to 3 images per chapter
      const imagePrompt = await this.buildSceneImagePrompt(scene, context);
      
      const generatedImage = await this.imageService.generateImage({
        prompt: imagePrompt.enhancedPrompt,
        style: context.worldContext?.genre === 'fantasy' ? 'fantasy-art' : 'realistic',
        aspectRatio: '16:9',
        quality: 'high'
      });

      images.push({
        id: uuid(),
        sceneDescription: scene.description,
        imageUrl: generatedImage.url,
        altText: await this.generateAltText(scene, generatedImage),
        placement: scene.position, // beginning, middle, end of scene
        mood: scene.mood
      });
    }

    return images;
  }

  private async generateAudioNarration(
    chapter: GeneratedChapter,
    context: StoryContext
  ): Promise<AudioNarration> {
    
    // Separate narrative text from dialogue
    const narrativeParts = await this.separateNarrativeFromDialogue(chapter.content);
    
    const audioSegments: AudioSegment[] = [];

    for (const part of narrativeParts) {
      if (part.type === 'narration') {
        // Use neutral narrator voice
        const audio = await this.audioService.synthesizeSpeech({
          text: part.text,
          voice: 'narrator',
          emotion: part.emotion || 'neutral',
          pace: part.pace || 'normal'
        });
        
        audioSegments.push({
          type: 'narration',
          audioUrl: audio.url,
          duration: audio.duration,
          text: part.text
        });
        
      } else if (part.type === 'dialogue') {
        // Use character-specific voice
        const character = context.characters.find(c => c.id === part.characterId);
        const characterVoice = character?.voiceProfile || 'default';
        
        const audio = await this.audioService.synthesizeSpeech({
          text: part.text,
          voice: characterVoice,
          emotion: part.emotion || character?.personality.dominantEmotion || 'neutral'
        });
        
        audioSegments.push({
          type: 'dialogue',
          characterId: part.characterId,
          characterName: character?.name,
          audioUrl: audio.url,
          duration: audio.duration,
          text: part.text
        });
      }
    }

    return {
      id: uuid(),
      chapterId: chapter.id,
      segments: audioSegments,
      totalDuration: audioSegments.reduce((total, segment) => total + segment.duration, 0),
      downloadUrl: await this.combineAudioSegments(audioSegments)
    };
  }

  private async generateInteractiveElements(chapter: GeneratedChapter): Promise<InteractiveElement[]> {
    const elements: InteractiveElement[] = [];
    
    // Identify decision points in the narrative
    const decisionPoints = await this.identifyDecisionPoints(chapter.content);
    
    for (const point of decisionPoints) {
      const choices = await this.generateChoices(point);
      
      elements.push({
        id: uuid(),
        type: 'choice',
        position: point.position,
        description: point.description,
        choices: choices,
        consequences: await this.analyzeChoiceConsequences(choices)
      });
    }

    // Add knowledge check questions for educational content
    const knowledgeChecks = await this.generateKnowledgeChecks(chapter.content);
    elements.push(...knowledgeChecks);

    return elements;
  }
}
```

### Educational Intelligence System

```typescript
// lib/ai/educational-ai-service.ts
export class EducationalAIService {
  private skillAnalyzer: WritingSkillAnalyzer;
  private progressTracker: ProgressTracker;
  private adaptiveComplexity: AdaptiveComplexityManager;

  async analyzeWritingSkills(userText: string, userId: string): Promise<SkillAssessment> {
    const analysis = await this.skillAnalyzer.analyze(userText);
    
    const assessment: SkillAssessment = {
      vocabulary: {
        level: analysis.vocabularyLevel,
        complexity: analysis.vocabularyComplexity,
        diversity: analysis.vocabularyDiversity,
        suggestions: await this.generateVocabularySuggestions(analysis)
      },
      
      grammar: {
        accuracy: analysis.grammarAccuracy,
        complexity: analysis.sentenceComplexity,
        structure: analysis.sentenceStructure,
        improvements: await this.generateGrammarImprovements(analysis)
      },
      
      narrative: {
        structure: analysis.narrativeStructure,
        pacing: analysis.pacing,
        characterDevelopment: analysis.characterDevelopment,
        plotCoherence: analysis.plotCoherence,
        suggestions: await this.generateNarrativeSuggestions(analysis)
      },
      
      creativity: {
        originality: analysis.originalityScore,
        imagination: analysis.imaginationScore,
        worldBuilding: analysis.worldBuildingSkill,
        encouragement: await this.generateCreativityEncouragement(analysis)
      }
    };

    await this.progressTracker.updateSkills(userId, assessment);
    return assessment;
  }

  async generatePersonalizedStoryPrompt(
    userId: string,
    skillLevel: SkillLevel,
    interests: string[]
  ): Promise<PersonalizedPrompt> {
    
    const userProgress = await this.progressTracker.getUserProgress(userId);
    const targetSkills = await this.identifyTargetSkills(userProgress);
    
    const prompt = await this.generatePromptForSkills({
      currentLevel: skillLevel,
      targetSkills: targetSkills,
      interests: interests,
      weakAreas: userProgress.weakAreas,
      strengths: userProgress.strengths
    });

    return {
      prompt: prompt.text,
      skillTargets: targetSkills,
      difficulty: prompt.difficulty,
      educationalGoals: prompt.goals,
      supportResources: await this.generateSupportResources(targetSkills)
    };
  }

  async adaptStoryComplexity(
    story: GeneratedStory,
    userSkillLevel: SkillLevel,
    comprehensionFeedback?: ComprehensionFeedback
  ): Promise<AdaptedStory> {
    
    const complexityAnalysis = await this.analyzeStoryComplexity(story);
    const targetComplexity = await this.calculateTargetComplexity(userSkillLevel, comprehensionFeedback);
    
    if (complexityAnalysis.level > targetComplexity.maximum) {
      // Simplify the story
      return await this.simplifyStory(story, targetComplexity);
    } else if (complexityAnalysis.level < targetComplexity.minimum) {
      // Add complexity to the story
      return await this.enhanceStoryComplexity(story, targetComplexity);
    }
    
    return {
      ...story,
      adaptations: [],
      targetComplexity: targetComplexity
    };
  }

  private async simplifyStory(story: GeneratedStory, target: ComplexityTarget): Promise<AdaptedStory> {
    const adaptations: StoryAdaptation[] = [];

    // Simplify vocabulary
    if (story.complexity.vocabulary > target.vocabulary) {
      const simplifiedChapters = await Promise.all(
        story.chapters.map(chapter => this.simplifyVocabulary(chapter, target.vocabulary))
      );
      story.chapters = simplifiedChapters;
      adaptations.push({
        type: 'vocabulary-simplification',
        description: 'Replaced complex words with simpler alternatives'
      });
    }

    // Simplify sentence structure
    if (story.complexity.sentences > target.sentences) {
      const restructuredChapters = await Promise.all(
        story.chapters.map(chapter => this.simplifySentences(chapter, target.sentences))
      );
      story.chapters = restructuredChapters;
      adaptations.push({
        type: 'sentence-simplification',
        description: 'Broke down complex sentences into simpler ones'
      });
    }

    // Simplify plot if too complex
    if (story.complexity.plot > target.plot) {
      const simplifiedPlot = await this.simplifyPlotStructure(story, target.plot);
      story.outline = simplifiedPlot.outline;
      adaptations.push({
        type: 'plot-simplification',
        description: 'Reduced plot complexity and subplot count'
      });
    }

    return {
      ...story,
      adaptations: adaptations,
      originalComplexity: story.complexity,
      targetComplexity: target
    };
  }
}
```

This comprehensive AI Narrative Architecture provides the technical foundation for advanced story generation, cross-module integration, multimedia content creation, and educational intelligence - positioning Narrative Forge as a sophisticated yet accessible storytelling platform that grows with its users.