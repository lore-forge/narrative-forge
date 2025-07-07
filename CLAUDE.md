# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Narrative Forge** module - the 4th pillar of the Lore Forge ecosystem, specializing in AI-powered narrative generation and interactive storytelling. It seamlessly integrates with existing modules (RPG Immersive, World Builder, AI Services) to create rich, educational storytelling experiences.

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Development server (port 3004)
npm run dev

# Build for production
npm run build
npm start

# Type checking and linting
npm run type-check
npm run lint
```

### Testing & Validation
```bash
# Run test suite
npm test
npm run test:watch
npm run test:coverage

# Integration testing
npm run test:ai-services
npm run test:cross-module

# Environment validation
npm run validate:env
```

### AI & Content Generation
```bash
# Setup Firebase for stories
npm run setup:firebase

# Generate TypeScript definitions
npm run generate:types

# Seed story templates
npm run seed:templates
```

## Architecture Overview

Narrative Forge follows the established Lore Forge patterns while extending them for storytelling:

### Core Integration Points
1. **AI Services Extension**: Adds `VertexAINarrativeService` to the centralized library
2. **Cross-Module Bridge**: Imports characters from RPG Immersive, worlds from World Builder
3. **Firebase Integration**: Uses the hybrid SDK pattern for consistent data operations
4. **Multimedia Pipeline**: Generates images, audio, and interactive elements

### Key Services Structure
```
lib/
├── ai/
│   ├── vertex-ai-narrative-service.ts    # 5th AI Agent: "Narrative Weaver"
│   ├── story-memory-manager.ts           # Continuity and consistency
│   ├── style-processor.ts                # Writing style adaptation
│   └── multimedia-narrative-service.ts   # Image/audio generation
├── integrations/
│   ├── character-integration.ts           # RPG character import
│   ├── world-integration.ts               # World Builder integration
│   ├── adventure-adaptation.ts            # RPG session to story conversion
│   └── sync-service.ts                    # Real-time cross-module sync
├── educational/
│   ├── skill-analyzer.ts                  # Writing skill assessment
│   ├── progress-tracker.ts                # Educational progress
│   └── adaptive-complexity.ts             # Difficulty adaptation
└── story/
    ├── story-service.ts                    # Core story CRUD operations
    ├── chapter-service.ts                  # Chapter management
    └── collaboration-service.ts            # Multi-user editing
```

## Key Implementation Patterns

### The 5th AI Agent Pattern
Narrative Forge introduces the "Narrative Weaver" - the 5th specialized AI agent:

```typescript
export class VertexAINarrativeService extends BaseAIService {
  async generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    const enhancedPrompt = await this.enhancePromptWithContext(request);
    const storyStructure = await this.generateStoryStructure(enhancedPrompt);
    const chapters = await this.generateChapters(storyStructure);
    return this.postProcessStory(chapters, request);
  }

  async generateNextChapter(context: StoryContext): Promise<GeneratedChapter> {
    const storyMemory = await this.storyMemory.getContext(context.storyId);
    const plotProgression = await this.analyzePlotProgression(storyMemory);
    return this.generateSingleChapter(plotProgression);
  }
}
```

### Cross-Module Integration Pattern
All integrations follow the established Lore Forge bridge pattern:

```typescript
export class CharacterIntegrationService {
  async importCharacterFromRPG(characterId: string, userId: string): Promise<StoryCharacter> {
    // Validate user authentication (Lore Forge pattern)
    if (!await this.validateUser(userId)) {
      throw new Error('Usuario no autenticado');
    }

    const rpgCharacter = await this.rpgService.getCharacter(characterId, userId);
    return this.convertToStoryCharacter(rpgCharacter);
  }

  async syncCharacterUpdates(characterId: string): Promise<void> {
    // Monitor RPG character changes and update story versions
    const affectedStories = await this.getStoriesUsingCharacter(characterId);
    for (const story of affectedStories) {
      await this.updateCharacterInStory(story.id, characterId);
    }
  }
}
```

### Educational AI Pattern
All educational features integrate AI assessment with progress tracking:

```typescript
export class EducationalAIService {
  async analyzeWritingSkills(userText: string, userId: string): Promise<SkillAssessment> {
    const analysis = await this.skillAnalyzer.analyze(userText);
    const assessment = this.buildAssessment(analysis);
    await this.progressTracker.updateSkills(userId, assessment);
    return assessment;
  }

  async adaptStoryComplexity(
    story: GeneratedStory,
    userSkillLevel: SkillLevel
  ): Promise<AdaptedStory> {
    const complexity = await this.analyzeStoryComplexity(story);
    if (complexity.level > userSkillLevel.maximum) {
      return await this.simplifyStory(story, userSkillLevel);
    }
    return story;
  }
}
```

## Environment Configuration

### Required Variables
```env
# Extend existing Lore Forge configuration with:

# Narrative-specific AI settings
NARRATIVE_AI_MODEL=gemini-1.5-pro
NARRATIVE_TEMPERATURE=0.8
NARRATIVE_MAX_TOKENS=8192

# Story generation settings
STORY_GENERATION_TIMEOUT=30000
CHAPTER_GENERATION_TIMEOUT=10000
MAX_STORY_LENGTH=50000

# Educational features
ENABLE_SKILL_ASSESSMENT=true
ENABLE_ADAPTIVE_COMPLEXITY=true
COPPA_COMPLIANCE_MODE=true

# Multimedia generation
ENABLE_IMAGE_GENERATION=true
ENABLE_AUDIO_GENERATION=true
IMAGE_STORAGE_BUCKET=narrative-images
AUDIO_STORAGE_BUCKET=narrative-audio

# Cross-module integration
RPG_IMMERSIVE_API_URL=http://localhost:3000/api
WORLD_BUILDER_API_URL=http://localhost:3003/api
ENABLE_REAL_TIME_SYNC=true
```

### Integration with Ecosystem Configuration
Narrative Forge reuses the core Lore Forge environment setup:
- **Firebase**: Same project, extended collections
- **Google Cloud**: Same service account, additional API scopes
- **AI Services**: Extends `lore-forge-ai-services` library

## Database Schema Extension

### New Firestore Collections
```typescript
interface NarrativeForgeSchema {
  stories: {
    id: string;
    userId: string;
    title: string;
    genre: Genre;
    status: 'draft' | 'in-progress' | 'completed' | 'published';
    chapters: SubCollection<Chapter>;
    
    // Cross-module integration
    importedCharacters: ImportedCharacter[];
    worldId?: string;
    sourceAdventureId?: string;
    
    // Educational tracking
    educationalMetrics: EducationalMetrics;
    skillTargets: SkillTarget[];
    
    // Multimedia elements
    coverImage?: GeneratedImage;
    audioNarration?: AudioNarration;
    
    createdAt: timestamp;
    updatedAt: timestamp;
  };

  story_chapters: {
    storyId: string;
    chapterNumber: number;
    title: string;
    content: string;
    
    // AI generation metadata
    generationPrompt: string;
    aiModel: string;
    generatedAt: timestamp;
    
    // Multimedia content
    images?: SceneImage[];
    audioSegments?: AudioSegment[];
    interactiveElements?: InteractiveElement[];
    
    // Educational elements
    complexityLevel: number;
    skillTargets: string[];
    knowledgeChecks?: KnowledgeCheck[];
  };

  user_writing_progress: {
    userId: string;
    currentLevel: SkillLevel;
    skillAssessments: SkillAssessment[];
    completedStories: string[];
    writingGoals: WritingGoal[];
    lastAssessment: timestamp;
  };

  story_templates: {
    id: string;
    name: string;
    genre: Genre;
    structure: PlotStructure;
    targetAge: AgeRange;
    educationalGoals: string[];
    promptTemplate: string;
  };
}
```

## Adding New Features

### Extending AI Capabilities
1. Add new methods to `VertexAINarrativeService`
2. Create corresponding prompt templates in `narrative-prompt-templates.ts`
3. Add TypeScript types in `types/narrative.ts`
4. Update tests in `tests/ai/`

### Adding Cross-Module Integrations
1. Create integration service in `lib/integrations/`
2. Add corresponding UI components in `components/integrations/`
3. Update sync service for real-time updates
4. Add integration tests in `tests/integration/`

### Educational Feature Development
1. Extend `EducationalAIService` with new assessment methods
2. Add progress tracking in `ProgressTracker`
3. Create UI components in `components/educational/`
4. Validate educational effectiveness with user testing

## Testing Strategy

### AI Service Testing
```bash
# Test story generation with various prompts
npm run test:ai-services

# Test cross-module character import
npm run test:character-integration

# Test world context integration
npm run test:world-integration

# Test educational assessment accuracy
npm run test:educational-ai
```

### Integration Testing
Focus on cross-module functionality:
- Character import from RPG Immersive
- World context from World Builder
- Adventure adaptation from game sessions
- Real-time synchronization across modules

### Educational Effectiveness Testing
- Writing skill improvement measurements
- Age-appropriate content validation
- COPPA compliance verification
- Accessibility testing for diverse learners

## Performance Considerations

### AI Response Optimization
- **Target**: <3 seconds for story generation
- **Caching**: Implement story memory caching for continuity
- **Batching**: Batch character imports and world queries
- **Streaming**: Stream chapter generation for long stories

### Cross-Module Sync Optimization
- **Real-time Updates**: Use Firebase realtime listeners efficiently
- **Conflict Resolution**: Handle concurrent edits across modules
- **Data Consistency**: Maintain referential integrity across modules

### Educational Content Optimization
- **Adaptive Loading**: Load educational content based on user level
- **Progress Caching**: Cache skill assessments for faster response
- **Content Preloading**: Preload age-appropriate templates and prompts

## Educational Compliance

### COPPA Compliance (Children under 13)
- Parental consent mechanisms
- Limited data collection
- Content appropriateness validation
- Privacy protection measures

### Educational Standards Alignment
- Age-appropriate learning objectives
- Skill progression tracking
- Assessment validity and reliability
- Accessibility for diverse learning needs

## Development Notes

### Code Quality Standards
- **TypeScript Strict Mode**: All types must be properly defined
- **Educational Safety**: All AI-generated content must pass safety filters
- **Cross-Module Compatibility**: Maintain API compatibility with other modules
- **Performance First**: Optimize for educational user experience

### AI Content Guidelines
- Age-appropriate language and themes
- Cultural sensitivity and inclusivity
- Educational value in generated content
- Positive messaging and character development

### Security Considerations
- Child data protection (COPPA compliance)
- Content moderation for inappropriate material
- User privacy and data minimization
- Safe social interaction features

This module represents the culmination of the Lore Forge ecosystem's educational and creative capabilities, providing a comprehensive platform for AI-assisted storytelling that grows with its users while maintaining the highest standards of safety and educational effectiveness.