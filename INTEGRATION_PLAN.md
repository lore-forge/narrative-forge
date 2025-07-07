# 🔗 Narrative Forge Integration Plan

This document outlines the comprehensive integration strategy for Narrative Forge within the Lore Forge ecosystem, detailing technical implementation, data flow, and cross-module synchronization.

## 🏗️ Integration Architecture

### Ecosystem Data Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RPG Immersive │    │ AI Services Lib │    │ World Builder   │    │ Narrative Forge │
│                 │    │                 │    │                 │    │                 │
│ Characters ────→│───→│ AI Processing  │←───│←──── Worlds     │←───│ Story Generation│
│ Adventures      │    │ Voice Synthesis │    │ NPCs           │    │ Interactive Fic │
│ Game Sessions   │    │ Image Gen       │    │ Locations       │    │ Multimedia      │
│                 │    │ Text Services   │    │ Campaigns       │    │ Collaboration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                ↑                                              ↓
                        ┌─────────────────┐                            ┌─────────────────┐
                        │ Firebase/Cloud  │                            │ Generated       │
                        │ Shared Storage  │                            │ Stories         │
                        │ Authentication  │                            │ Multimedia      │
                        └─────────────────┘                            └─────────────────┘
```

## 🔌 Cross-Module Integration Points

### 1. Character Integration (RPG Immersive → Narrative Forge)

#### Character Import Service
```typescript
// lib/integrations/character-integration.ts
export class CharacterIntegrationService {
  private rpgService: RPGImmersiveService;
  private firestoreService: FirestoreService;

  async importCharacterFromRPG(characterId: string, userId: string): Promise<StoryCharacter> {
    // Fetch character from RPG Immersive module
    const rpgCharacter = await this.rpgService.getCharacter(characterId, userId);
    
    // Transform RPG character to story character format
    const storyCharacter: StoryCharacter = {
      id: uuid(),
      sourceCharacterId: rpgCharacter.id,
      sourceModule: 'rpg-immersive',
      name: rpgCharacter.name,
      description: rpgCharacter.description,
      personality: this.extractPersonalityTraits(rpgCharacter),
      background: rpgCharacter.backstory,
      appearance: rpgCharacter.appearance,
      
      // Story-specific adaptations
      voiceProfile: this.generateVoiceProfile(rpgCharacter),
      narrativeRole: this.determineNarrativeRole(rpgCharacter),
      dialogueStyle: this.analyzeDialogueStyle(rpgCharacter),
      
      // Cross-module synchronization
      lastSync: new Date(),
      syncEnabled: true
    };

    return storyCharacter;
  }

  async syncCharacterUpdates(characterId: string): Promise<void> {
    // Monitor RPG character changes and update story versions
    const rpgCharacter = await this.rpgService.getCharacter(characterId);
    const storyVersions = await this.getStoriesUsingCharacter(characterId);
    
    for (const story of storyVersions) {
      await this.updateCharacterInStory(story.id, rpgCharacter);
    }
  }

  private extractPersonalityTraits(rpgCharacter: RPGCharacter): PersonalityProfile {
    return {
      traits: rpgCharacter.personalityTraits || [],
      motivations: rpgCharacter.motivations || [],
      fears: rpgCharacter.fears || [],
      ideals: rpgCharacter.ideals || [],
      // Convert RPG stats to personality indicators
      confidence: this.statToPersonality(rpgCharacter.stats.charisma),
      intelligence: this.statToPersonality(rpgCharacter.stats.intelligence),
      physicality: this.statToPersonality(rpgCharacter.stats.strength)
    };
  }
}
```

#### Character Selection Component
```typescript
// components/integrations/character-selector.tsx
export function CharacterSelector({ onCharacterSelect }: CharacterSelectorProps) {
  const [rpgCharacters, setRpgCharacters] = useState<RPGCharacter[]>([]);
  const [importedCharacters, setImportedCharacters] = useState<StoryCharacter[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadAvailableCharacters();
  }, [user]);

  const loadAvailableCharacters = async () => {
    const characters = await characterIntegration.getRPGCharacters(user.uid);
    setRpgCharacters(characters);
    
    const imported = await characterIntegration.getImportedCharacters(user.uid);
    setImportedCharacters(imported);
  };

  const handleImportCharacter = async (character: RPGCharacter) => {
    const storyCharacter = await characterIntegration.importCharacterFromRPG(
      character.id, 
      user.uid
    );
    
    setImportedCharacters(prev => [...prev, storyCharacter]);
    onCharacterSelect(storyCharacter);
  };

  return (
    <div className="character-selector">
      <Tabs defaultValue="rpg-characters">
        <TabsList>
          <TabsTrigger value="rpg-characters">Import from RPG</TabsTrigger>
          <TabsTrigger value="imported">My Story Characters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rpg-characters">
          <div className="grid grid-cols-2 gap-4">
            {rpgCharacters.map(character => (
              <CharacterCard 
                key={character.id}
                character={character}
                onImport={() => handleImportCharacter(character)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="imported">
          <div className="grid grid-cols-2 gap-4">
            {importedCharacters.map(character => (
              <StoryCharacterCard 
                key={character.id}
                character={character}
                onSelect={() => onCharacterSelect(character)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 2. World Integration (World Builder → Narrative Forge)

#### World Context Service
```typescript
// lib/integrations/world-integration.ts
export class WorldIntegrationService {
  private worldBuilderService: WorldBuilderService;
  
  async importWorldContext(worldId: string, userId: string): Promise<WorldContext> {
    const worldData = await this.worldBuilderService.getWorld(worldId, userId);
    
    return {
      id: worldData.id,
      name: worldData.name,
      description: worldData.description,
      genre: worldData.genre,
      
      // Location data for story settings
      locations: worldData.locations.map(location => ({
        id: location.id,
        name: location.name,
        description: location.description,
        type: location.type, // city, dungeon, wilderness, etc.
        connections: location.connections,
        mood: location.mood,
        pointsOfInterest: location.pointsOfInterest
      })),
      
      // NPCs for story characters
      npcs: worldData.npcs.map(npc => ({
        id: npc.id,
        name: npc.name,
        role: npc.role,
        personality: npc.personality,
        location: npc.location,
        relationships: npc.relationships
      })),
      
      // World lore for story consistency
      lore: {
        history: worldData.history,
        cultures: worldData.cultures,
        religions: worldData.religions,
        languages: worldData.languages,
        customs: worldData.customs
      },
      
      // Timeline for story chronology
      timeline: worldData.timeline,
      
      // Visual assets
      maps: worldData.maps,
      images: worldData.images
    };
  }

  async generateLocationBasedStory(
    locationId: string, 
    worldContext: WorldContext,
    storyParams: StoryGenerationParams
  ): Promise<LocationStory> {
    const location = worldContext.locations.find(l => l.id === locationId);
    if (!location) throw new Error('Location not found');

    const aiService = new VertexAINarrativeService();
    
    const storyPrompt = this.buildLocationStoryPrompt(location, worldContext, storyParams);
    const generatedStory = await aiService.generateStory({
      prompt: storyPrompt,
      context: {
        world: worldContext,
        location: location,
        mood: location.mood,
        genre: worldContext.genre
      },
      parameters: storyParams
    });

    return {
      ...generatedStory,
      locationId: location.id,
      worldId: worldContext.id,
      setting: location.name,
      worldConsistency: await this.validateWorldConsistency(generatedStory, worldContext)
    };
  }

  private buildLocationStoryPrompt(
    location: WorldLocation, 
    world: WorldContext, 
    params: StoryGenerationParams
  ): string {
    return `
      Create a ${params.genre} story set in ${location.name}, a ${location.type} in the world of ${world.name}.
      
      Location Details:
      - Description: ${location.description}
      - Mood: ${location.mood}
      - Points of Interest: ${location.pointsOfInterest.join(', ')}
      
      World Context:
      - Genre: ${world.genre}
      - Cultural Elements: ${world.lore.cultures.map(c => c.name).join(', ')}
      - Historical Context: ${world.lore.history.slice(0, 3).map(h => h.event).join(', ')}
      
      Story Requirements:
      - Target Audience: ${params.targetAudience}
      - Length: ${params.length}
      - Tone: ${params.tone}
      - Include local NPCs and customs
      - Maintain consistency with world lore
      - Incorporate location-specific elements
    `;
  }
}
```

### 3. Adventure Adaptation (RPG Sessions → Stories)

#### Adventure Adaptation Service
```typescript
// lib/integrations/adventure-adaptation.ts
export class AdventureAdaptationService {
  private rpgService: RPGImmersiveService;
  private narrativeService: VertexAINarrativeService;
  
  async adaptAdventureToStory(
    adventureId: string, 
    userId: string,
    adaptationOptions: AdaptationOptions
  ): Promise<AdaptedStory> {
    
    // Gather adventure data
    const adventure = await this.rpgService.getAdventure(adventureId, userId);
    const sessions = await this.rpgService.getAdventureSessions(adventureId, userId);
    const characters = await this.rpgService.getAdventureCharacters(adventureId, userId);
    
    // Analyze session data for narrative elements
    const narrativeElements = await this.extractNarrativeElements(sessions);
    
    // Generate story structure
    const storyStructure = await this.generateStoryStructure(
      adventure, 
      narrativeElements, 
      adaptationOptions
    );
    
    // Convert sessions to chapters
    const chapters = await Promise.all(
      sessions.map(session => this.convertSessionToChapter(session, characters))
    );
    
    // Generate narrative prose
    const story = await this.narrativeService.generateStory({
      title: adventure.title,
      outline: storyStructure,
      chapters: chapters,
      characters: characters,
      style: adaptationOptions.narrativeStyle,
      perspective: adaptationOptions.perspective, // first-person, third-person, etc.
      tense: adaptationOptions.tense // past, present
    });
    
    return {
      ...story,
      sourceAdventureId: adventureId,
      adaptationMethod: 'rpg-session',
      originalSessions: sessions.length,
      characters: characters,
      timeline: this.generateTimeline(sessions),
      gameElements: {
        diceRolls: this.extractSignificantRolls(sessions),
        combatEncounters: this.extractCombats(sessions),
        characterDecisions: this.extractDecisions(sessions)
      }
    };
  }

  private async extractNarrativeElements(sessions: GameSession[]): Promise<NarrativeElements> {
    const elements: NarrativeElements = {
      plotPoints: [],
      characterMoments: [],
      conflicts: [],
      resolutions: [],
      themes: []
    };

    for (const session of sessions) {
      // AI analysis of session content
      const analysis = await this.narrativeService.analyzeSessionForStory(session);
      
      elements.plotPoints.push(...analysis.plotPoints);
      elements.characterMoments.push(...analysis.characterMoments);
      elements.conflicts.push(...analysis.conflicts);
      elements.resolutions.push(...analysis.resolutions);
    }

    return elements;
  }

  private async convertSessionToChapter(
    session: GameSession, 
    characters: Character[]
  ): Promise<ChapterDraft> {
    
    return {
      title: session.title || `Chapter ${session.sessionNumber}`,
      rawContent: session.transcript,
      sceneBreakdown: session.scenes,
      characterActions: session.characterActions,
      narrativeBeats: await this.identifyNarrativeBeats(session),
      mood: session.mood || 'neutral',
      pacing: this.analyzePacing(session),
      keyMoments: this.extractKeyMoments(session)
    };
  }
}
```

## 🔄 Real-Time Synchronization

### Data Sync Service
```typescript
// lib/integrations/sync-service.ts
export class CrossModuleSyncService {
  private subscribers: Map<string, SyncSubscriber[]> = new Map();
  private firestore: FirebaseFirestore.Firestore;
  
  constructor() {
    this.setupFirestoreListeners();
  }

  // Listen for changes in other modules
  private setupFirestoreListeners() {
    // Character updates from RPG Immersive
    this.firestore.collection('characters').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          this.handleCharacterUpdate(change.doc.data());
        }
      });
    });

    // World updates from World Builder
    this.firestore.collection('worlds').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          this.handleWorldUpdate(change.doc.data());
        }
      });
    });
  }

  async subscribeToCharacterUpdates(
    characterId: string, 
    callback: (character: Character) => void
  ): Promise<void> {
    if (!this.subscribers.has(characterId)) {
      this.subscribers.set(characterId, []);
    }
    
    this.subscribers.get(characterId)!.push({
      type: 'character',
      callback: callback
    });
  }

  private async handleCharacterUpdate(characterData: any): Promise<void> {
    const characterId = characterData.id;
    const subscribers = this.subscribers.get(characterId) || [];
    
    // Update any stories using this character
    const affectedStories = await this.getStoriesUsingCharacter(characterId);
    
    for (const story of affectedStories) {
      await this.updateCharacterInStory(story.id, characterData);
      
      // Notify story editors
      this.notifyStoryUpdate(story.id, {
        type: 'character-update',
        characterId: characterId,
        changes: characterData
      });
    }
    
    // Call registered callbacks
    subscribers.forEach(subscriber => {
      subscriber.callback(characterData);
    });
  }

  async updateCharacterInStory(storyId: string, updatedCharacter: Character): Promise<void> {
    const story = await this.getStory(storyId);
    if (!story) return;

    // Update character data in story
    const characterIndex = story.characters.findIndex(c => c.sourceCharacterId === updatedCharacter.id);
    if (characterIndex !== -1) {
      story.characters[characterIndex] = {
        ...story.characters[characterIndex],
        ...this.mapRPGCharacterToStoryCharacter(updatedCharacter),
        lastSync: new Date()
      };

      await this.saveStory(story);
    }
  }
}
```

## 🤖 AI Service Extensions

### Narrative AI Service Enhancement
```typescript
// lib/ai/narrative-ai-service.ts
export class VertexAINarrativeService extends BaseAIService {
  
  async generateStoryFromPrompt(request: StoryGenerationRequest): Promise<GeneratedStory> {
    const enhancedPrompt = await this.enhancePromptWithContext(request);
    
    const storyOutline = await this.generateStoryOutline(enhancedPrompt);
    const chapters = await this.generateChapters(storyOutline, request.chapterCount || 5);
    
    return {
      id: uuid(),
      title: storyOutline.title,
      description: storyOutline.description,
      genre: request.genre,
      chapters: chapters,
      outline: storyOutline,
      metadata: {
        wordCount: this.calculateWordCount(chapters),
        estimatedReadingTime: this.calculateReadingTime(chapters),
        complexity: this.analyzeComplexity(chapters),
        themes: storyOutline.themes
      },
      generatedAt: new Date()
    };
  }

  async enhancePromptWithContext(request: StoryGenerationRequest): Promise<EnhancedPrompt> {
    let contextualPrompt = request.initialPrompt;
    
    // Add character context if characters are imported
    if (request.characters && request.characters.length > 0) {
      const characterContext = request.characters.map(char => 
        `Character: ${char.name} - ${char.description}, Personality: ${char.personality.traits.join(', ')}`
      ).join('\n');
      
      contextualPrompt += `\n\nAvailable Characters:\n${characterContext}`;
    }
    
    // Add world context if world is selected
    if (request.worldContext) {
      const worldContext = `
        World: ${request.worldContext.name} - ${request.worldContext.description}
        Genre: ${request.worldContext.genre}
        Key Locations: ${request.worldContext.locations.slice(0, 3).map(l => l.name).join(', ')}
        Cultural Elements: ${request.worldContext.lore.cultures.map(c => c.name).join(', ')}
      `;
      
      contextualPrompt += `\n\nWorld Setting:\n${worldContext}`;
    }
    
    // Add genre-specific guidance
    const genreGuidance = await this.getGenreGuidance(request.genre);
    contextualPrompt += `\n\nGenre Guidelines:\n${genreGuidance}`;
    
    return {
      originalPrompt: request.initialPrompt,
      enhancedPrompt: contextualPrompt,
      context: {
        hasCharacters: !!request.characters?.length,
        hasWorld: !!request.worldContext,
        genre: request.genre,
        targetAudience: request.targetAudience
      }
    };
  }

  async generateChapterWithCharacterFocus(
    chapterOutline: ChapterOutline,
    focusCharacter: StoryCharacter,
    worldContext?: WorldContext
  ): Promise<GeneratedChapter> {
    
    const characterPrompt = `
      Write a chapter focusing on ${focusCharacter.name}.
      
      Character Details:
      - Personality: ${focusCharacter.personality.traits.join(', ')}
      - Background: ${focusCharacter.background}
      - Current Role: ${focusCharacter.narrativeRole}
      - Voice Style: ${focusCharacter.dialogueStyle}
      
      Chapter Outline: ${chapterOutline.summary}
      
      Requirements:
      - Show character growth and development
      - Include meaningful dialogue that reflects personality
      - Advance the main plot
      - Maintain consistency with previous chapters
      ${worldContext ? `- Stay true to world setting: ${worldContext.name}` : ''}
    `;

    const response = await this.vertexAI.generateContent({
      prompt: characterPrompt,
      temperature: 0.8,
      maxOutputTokens: 2000
    });

    return {
      title: chapterOutline.title,
      content: response.candidates[0].content.parts[0].text,
      focusCharacter: focusCharacter.id,
      wordCount: this.countWords(response.candidates[0].content.parts[0].text),
      mood: this.analyzeMood(response.candidates[0].content.parts[0].text),
      characterDevelopment: await this.analyzeCharacterDevelopment(
        response.candidates[0].content.parts[0].text,
        focusCharacter
      )
    };
  }

  async adaptWritingStyle(
    text: string, 
    targetStyle: WritingStyle,
    preserveCharacterVoices: boolean = true
  ): Promise<StyledText> {
    
    const stylePrompt = `
      Rewrite the following text to match the ${targetStyle.name} writing style.
      
      Style Characteristics:
      - Tone: ${targetStyle.tone}
      - Sentence Structure: ${targetStyle.sentenceStructure}
      - Vocabulary Level: ${targetStyle.vocabularyLevel}
      - Narrative Voice: ${targetStyle.narrativeVoice}
      
      ${preserveCharacterVoices ? 'Preserve character dialogue and personality voices.' : ''}
      
      Original Text:
      ${text}
      
      Rewritten Text:
    `;

    const response = await this.vertexAI.generateContent({
      prompt: stylePrompt,
      temperature: 0.7,
      maxOutputTokens: text.length * 1.2
    });

    return {
      originalText: text,
      styledText: response.candidates[0].content.parts[0].text,
      appliedStyle: targetStyle,
      preservedElements: preserveCharacterVoices ? ['character-voices', 'dialogue'] : [],
      qualityScore: await this.evaluateStyleAdaptation(text, response.candidates[0].content.parts[0].text)
    };
  }
}
```

## 📊 Integration Testing Strategy

### Cross-Module Integration Tests
```typescript
// tests/integration/cross-module.test.ts
describe('Cross-Module Integration', () => {
  
  test('Character import from RPG Immersive', async () => {
    // Create character in RPG module
    const rpgCharacter = await rpgService.createCharacter({
      name: 'Test Hero',
      class: 'Warrior',
      stats: { strength: 16, charisma: 14 }
    });

    // Import to Narrative Forge
    const storyCharacter = await characterIntegration.importCharacterFromRPG(
      rpgCharacter.id,
      'test-user'
    );

    expect(storyCharacter.name).toBe('Test Hero');
    expect(storyCharacter.sourceCharacterId).toBe(rpgCharacter.id);
    expect(storyCharacter.personality.confidence).toBeGreaterThan(0.5); // Based on charisma
  });

  test('World context integration', async () => {
    // Create world in World Builder
    const world = await worldBuilderService.createWorld({
      name: 'Test Realm',
      genre: 'fantasy'
    });

    // Import to Narrative Forge
    const worldContext = await worldIntegration.importWorldContext(
      world.id,
      'test-user'
    );

    expect(worldContext.name).toBe('Test Realm');
    expect(worldContext.genre).toBe('fantasy');
  });

  test('Adventure adaptation', async () => {
    // Create adventure session in RPG module
    const adventure = await rpgService.createAdventure({
      title: 'The Lost Temple'
    });
    
    const session = await rpgService.addSession(adventure.id, {
      events: ['Entered temple', 'Fought skeleton warrior', 'Found treasure']
    });

    // Adapt to story
    const adaptedStory = await adventureAdaptation.adaptAdventureToStory(
      adventure.id,
      'test-user',
      { narrativeStyle: 'adventure', perspective: 'third-person' }
    );

    expect(adaptedStory.title).toBe('The Lost Temple');
    expect(adaptedStory.chapters).toHaveLength(1);
    expect(adaptedStory.sourceAdventureId).toBe(adventure.id);
  });

  test('Real-time synchronization', async () => {
    // Create story with imported character
    const story = await storyService.createStory({
      title: 'Test Story',
      characters: [importedCharacter]
    });

    // Update character in RPG module
    await rpgService.updateCharacter(importedCharacter.sourceCharacterId, {
      description: 'Updated description'
    });

    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if story character was updated
    const updatedStory = await storyService.getStory(story.id);
    const updatedCharacter = updatedStory.characters.find(
      c => c.sourceCharacterId === importedCharacter.sourceCharacterId
    );

    expect(updatedCharacter.description).toBe('Updated description');
  });
});
```

This comprehensive integration plan ensures Narrative Forge seamlessly connects with all existing Lore Forge modules while maintaining data consistency and providing rich, context-aware storytelling capabilities.