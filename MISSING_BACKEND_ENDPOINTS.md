# Missing Backend Endpoints

This document identifies functionality found in the Narrative Forge application logic that is **NOT** supported by the current AI Services backend API. These features are currently implemented in `lib/ai/vertex-ai-narrative-service.ts` but have no corresponding endpoints in the API documentation.

## Critical Missing Features

### 1. Story Structure Analysis
**Feature Name:** `analyzeStoryStructure`  
**Description:** Analyzes a complete story to identify plot structure, character development arcs, themes, and educational value for feedback purposes.  
**Input Data Required:**
- `story: string` - The full text of a story to analyze
- `analysisType?: string` - Type of analysis requested ('plot', 'character', 'educational', 'all')

**Expected Return Data:**
```typescript
interface PlotAnalysis {
  plotStructure: {
    exposition: string;
    risingAction: string[];
    climax: string;
    fallingAction: string[];
    resolution: string;
  };
  characterArcs: Array<{
    characterName: string;
    startingTraits: string[];
    development: string[];
    endingTraits: string[];
    arcType: 'growth' | 'fall' | 'static' | 'discovery';
  }>;
  themes: Array<{
    theme: string;
    evidence: string[];
    prominence: number; // 1-10
  }>;
  educationalValue: number; // 1-10
  suggestions: string[];
  complexity: {
    vocabularyLevel: number;
    syntaxComplexity: number;
    conceptualDifficulty: number;
  };
}
```

### 2. Story Complexity Adaptation
**Feature Name:** `adaptStoryComplexity`  
**Description:** Modifies an existing story to match a target reading level or skill level, either simplifying or enhancing vocabulary, sentence structure, and concepts.  
**Input Data Required:**
- `story: GeneratedStory` - The complete story object to adapt
- `targetLevel: SkillLevel` - Target skill level ('beginner', 'elementary', 'intermediate', 'advanced', 'expert')
- `adaptationType?: string` - Type of adaptation ('vocabulary', 'syntax', 'concepts', 'all')

**Expected Return Data:**
```typescript
interface AdaptedStory extends GeneratedStory {
  adaptations: Array<{
    type: 'simplification' | 'enhancement' | 'vocabulary' | 'syntax' | 'concept';
    description: string;
    chaptersAffected: number[];
    exampleChanges: Array<{
      before: string;
      after: string;
      reason: string;
    }>;
  }>;
  originalComplexity: number;
  targetComplexity: number;
  adaptationSuccess: boolean;
  qualityMetrics: {
    readabilityScore: number;
    vocabularyDiversity: number;
    conceptualCoherence: number;
  };
}
```

### 3. Enhanced Prompt Context Building
**Feature Name:** `enhancePromptWithContext`  
**Description:** Takes a basic story prompt and enhances it with character data from RPG Immersive, world data from World Builder, and educational context.  
**Input Data Required:**
- `request: StoryGenerationRequest` - Basic story generation request
- `characterData?: ImportedCharacter[]` - Characters imported from RPG Immersive
- `worldData?: WorldContext` - World context from World Builder
- `crossModuleSync?: boolean` - Whether to sync data across modules

**Expected Return Data:**
```typescript
interface EnhancedPrompt {
  originalPrompt: string;
  enhancedPrompt: string;
  contextElements: Array<{
    type: 'character' | 'world' | 'educational' | 'genre';
    source: 'rpg-immersive' | 'world-builder' | 'narrative-forge' | 'ai-generated';
    content: string;
    weight: number; // influence on story generation
  }>;
  estimatedComplexity: number;
  crossModuleReferences: Array<{
    moduleId: string;
    entityId: string;
    entityType: string;
    lastSync: string;
  }>;
  enhancementMetadata: {
    processingTime: number;
    enhancementQuality: number;
    contextCoherence: number;
  };
}
```

### 4. Plot Progression Analysis
**Feature Name:** `analyzePlotProgression`  
**Description:** Analyzes the current state of a story to determine optimal direction for the next chapter, including tension levels, pacing, and character development needs.  
**Input Data Required:**
- `context: StoryContext` - Current story context including previous chapters
- `targetProgression?: 'slow' | 'moderate' | 'fast'` - Desired pacing
- `focusAreas?: string[]` - Areas to focus on ('plot', 'character', 'world', 'conflict')

**Expected Return Data:**
```typescript
interface PlotProgression {
  currentState: {
    tensionLevel: number; // 1-10
    paceLevel: number; // 1-10
    characterDevelopmentStatus: Array<{
      characterName: string;
      arcProgress: number; // 0-100%
      nextDevelopmentOpportunity: string;
    }>;
    plotPointsRemaining: string[];
  };
  recommendations: {
    nextPlotPoint: string;
    recommendedTensionChange: number;
    suggestedPacing: 'accelerate' | 'maintain' | 'decelerate';
    characterFocusSuggestions: string[];
    conflictEscalation: boolean;
  };
  chapterGuidance: {
    recommendedLength: number; // words
    keyScenes: string[];
    dialogueToNarrationRatio: number;
    moodProgression: string;
  };
}
```

### 5. Educational Content Integration
**Feature Name:** `generateEducationalContent`  
**Description:** Generates educational elements to be embedded within stories, including knowledge checks, skill-building exercises, and learning assessments.  
**Input Data Required:**
- `storyContext: string` - Context of the story where educational content will be placed
- `skillTargets: SkillTarget[]` - Educational skills to target
- `targetAudience: AudienceLevel` - Age/skill level of the audience
- `contentType: 'knowledge-check' | 'exercise' | 'reflection' | 'activity'` - Type of educational content

**Expected Return Data:**
```typescript
interface EducationalContent {
  contentId: string;
  contentType: 'knowledge-check' | 'exercise' | 'reflection' | 'activity';
  title: string;
  description: string;
  content: {
    instructions: string;
    questions?: Array<{
      id: string;
      question: string;
      type: 'multiple-choice' | 'short-answer' | 'essay' | 'creative';
      options?: string[];
      correctAnswer?: string;
      explanation?: string;
    }>;
    activities?: Array<{
      id: string;
      title: string;
      description: string;
      materials?: string[];
      steps: string[];
      expectedOutcome: string;
    }>;
  };
  skillTargets: string[];
  difficulty: number; // 1-10
  estimatedTime: number; // minutes
  placement: {
    chapterNumber: number;
    position: 'beginning' | 'middle' | 'end' | 'between-chapters';
    contextIntegration: string;
  };
}
```

### 6. Cross-Module Character Synchronization
**Feature Name:** `syncCharacterAcrossModules`  
**Description:** Synchronizes character data between Narrative Forge and RPG Immersive, ensuring consistency when characters are used in both storytelling and gameplay.  
**Input Data Required:**
- `characterId: string` - ID of the character to sync
- `sourceModule: 'rpg-immersive' | 'narrative-forge'` - Which module has the authoritative version
- `syncType: 'full' | 'appearance' | 'personality' | 'stats'` - What aspects to sync
- `conflictResolution?: 'manual' | 'source-wins' | 'merge'` - How to handle conflicts

**Expected Return Data:**
```typescript
interface CharacterSyncResult {
  characterId: string;
  syncSuccess: boolean;
  conflicts: Array<{
    field: string;
    sourceValue: any;
    targetValue: any;
    resolution: 'source-kept' | 'target-kept' | 'merged' | 'manual-required';
    reasoning: string;
  }>;
  updatedCharacter: {
    narrativeVersion: StoryCharacter;
    rpgVersion: any; // RPG character format
  };
  lastSync: string;
  nextSyncRecommended: string;
  syncMetadata: {
    dataConsistency: number; // 0-100%
    syncQuality: number; // 0-100%
    modulesAffected: string[];
  };
}
```

### 7. World Context Integration
**Feature Name:** `integrateWorldContext`  
**Description:** Integrates world data from World Builder module into narrative generation, ensuring story elements align with established world lore, geography, and cultures.  
**Input Data Required:**
- `worldId: string` - ID of the world from World Builder
- `storyContext: StoryGenerationRequest` - Current story being generated
- `integrationLevel: 'light' | 'moderate' | 'heavy'` - How much world detail to include
- `focusAreas?: string[]` - Specific world aspects to emphasize

**Expected Return Data:**
```typescript
interface WorldIntegration {
  worldId: string;
  integrationSuccess: boolean;
  integratedElements: {
    geography: Array<{
      locationName: string;
      locationType: string;
      relevanceToStory: string;
      descriptionSnippet: string;
    }>;
    cultures: Array<{
      cultureName: string;
      traits: string[];
      relevanceToCharacters: string[];
      customsToInclude: string[];
    }>;
    history: Array<{
      event: string;
      timeframe: string;
      impactOnStory: string;
      narrative: string;
    }>;
    lore: Array<{
      concept: string;
      explanation: string;
      storyIntegration: string;
    }>;
  };
  consistencyChecks: {
    geographyConsistent: boolean;
    cultureConsistent: boolean;
    historyConsistent: boolean;
    timelineConsistent: boolean;
  };
  recommendations: string[];
}
```

### 8. Interactive Story Element Generation
**Feature Name:** `generateInteractiveElements`  
**Description:** Creates interactive elements for stories such as branching choices, mini-games, and reader participation points.  
**Input Data Required:**
- `chapterContext: string` - Context where interactive element will be placed
- `interactionType: 'choice' | 'puzzle' | 'game' | 'reflection'` - Type of interaction
- `difficulty: number` - Difficulty level (1-10)
- `educationalObjective?: string` - Learning goal for the interaction

**Expected Return Data:**
```typescript
interface InteractiveElement {
  elementId: string;
  type: 'choice' | 'puzzle' | 'game' | 'reflection';
  title: string;
  description: string;
  placement: {
    chapterNumber: number;
    paragraphPosition: number;
    integrationText: string;
  };
  content: {
    choices?: Array<{
      id: string;
      text: string;
      outcome: string;
      consequence: string;
      skillsRequired?: string[];
    }>;
    puzzle?: {
      question: string;
      clues: string[];
      solution: string;
      hints: string[];
    };
    game?: {
      instructions: string;
      mechanics: any;
      winCondition: string;
      rewards: string[];
    };
    reflection?: {
      prompt: string;
      guidingQuestions: string[];
      expectedLength: number;
    };
  };
  educationalValue: number;
  engagementLevel: number;
  estimatedTime: number; // minutes
}
```

## Implementation Priority

1. **High Priority** (Core narrative functionality):
   - Story Structure Analysis
   - Plot Progression Analysis
   - Enhanced Prompt Context Building

2. **Medium Priority** (Educational features):
   - Educational Content Integration
   - Story Complexity Adaptation

3. **Lower Priority** (Cross-module integration):
   - Cross-Module Character Synchronization
   - World Context Integration
   - Interactive Story Element Generation

## Technical Notes

- All missing endpoints would need to be added to the AI Services Cloud Functions
- The current client implementation uses caching extensively, which should be preserved
- Cross-module functionality requires coordination with RPG Immersive and World Builder APIs
- Educational features need COPPA compliance considerations
- Interactive elements may require additional UI components

## Temporary Workarounds

Until these endpoints are implemented, the application can:

1. Use simplified story generation without advanced analysis
2. Implement basic complexity adaptation on the client side
3. Disable cross-module integration features
4. Provide static educational content instead of dynamic generation
5. Use predetermined interactive elements instead of AI-generated ones

## API Design Suggestions

When implementing these endpoints, consider:

- RESTful endpoint structure: `/api/v1/narrative/{feature}`
- Consistent error handling and response formats
- Caching support for performance optimization
- Rate limiting for resource-intensive operations
- Batch processing capabilities for multiple operations
- Webhook support for real-time cross-module synchronization