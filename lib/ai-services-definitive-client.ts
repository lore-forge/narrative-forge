/**
 * Definitive AI Services Client for Lore Forge
 * 
 * This is the single source of truth for all AI service interactions.
 * Built strictly according to AI_SERVICES_API_DOCUMENTATION.md
 * 
 * @module ai-services-definitive-client
 */

// ============================================================================
// Configuration
// ============================================================================

const AI_SERVICES_BASE_URL = 'https://us-central1-gen-lang-client-0780430254.cloudfunctions.net';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Generic API response wrapper used by all endpoints
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
  cached?: boolean;
  source?: string;
}

/**
 * Health check response structure
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  services: string[];
  caching: 'enabled' | 'disabled';
}

/**
 * Voice configuration for text-to-speech
 */
export interface VoiceConfig {
  characterId?: 'narrator' | 'merchant' | 'sage' | 'mysterious' | 'companion';
  emotion?: 'neutral' | 'dramatic' | 'mysterious' | 'excited' | 'somber' | 'thoughtful';
  customSSML?: string;
  languageCode?: string;
  voiceName?: string;
}

/**
 * Generated character structure (Spanish field names as per API)
 */
export interface GeneratedCharacter {
  nombre: string;
  raza: string;
  clase: string;
  edad: number;
  motivaciones: string[];
  apariencia: {
    altura: string;
    constitucion: string;
    cabello: string;
    ojos: string;
    rasgos_distintivos: string[];
  };
  personalidad: {
    rasgos: string[];
    ideales: string[];
    vinculos: string[];
    defectos: string[];
  };
  historia: {
    origen: string;
    eventos_importantes: string[];
    objetivos_actuales: string[];
  };
  habilidades: {
    combate: string[];
    sociales: string[];
    conocimientos: string[];
    especiales: string[];
  };
  equipo: {
    armas: string[];
    armadura: string;
    objetos_especiales: string[];
  };
  estadisticas: {
    fuerza: number;
    destreza: number;
    constitucion: number;
    inteligencia: number;
    sabiduria: number;
    carisma: number;
  };
}

/**
 * World history generation response
 */
export interface WorldHistory {
  worldName: string;
  geography: {
    continents: Array<{ name: string; size: number; features: string[] }>;
    climateZones: Array<{ zone: string; description: string }>;
  };
  cultures: Array<{ name: string; traits: string[]; traditions: string[] }>;
  historyHighlights: Array<{ event: string; year: number; description: string }>;
}

/**
 * Monster/creature generation response
 */
export interface GeneratedMonster {
  creatureName: string;
  type: string;
  description: string;
  abilities: Array<{ name: string; effect: string }>;
  habitat: string;
  imageUrl?: string | null;
}

/**
 * Mission generation types
 */
export type MissionType = 'main' | 'side' | 'fetch' | 'escort' | 'combat' | 'puzzle';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export interface GeneratedMission {
  title: string;
  type: string;
  difficulty: string;
  description: string;
  objectives: Array<{ id: string; description: string; completed: boolean }>;
  rewards: Array<{ 
    type: 'experience' | 'gold' | 'item' | 'reputation'; 
    amount: number; 
    description: string;
  }>;
  npcsInvolved: Array<{ name: string; role: string; location: string }>;
  estimatedDuration: string;
}

/**
 * NPC generation response
 */
export interface GeneratedNPC {
  name: string;
  race: string;
  occupation: string;
  age: string;
  personality: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
  appearance: string;
  backstory: string;
  motivation: string;
  secrets: string[];
  relationships: Array<{ name: string; relationship: string; description: string }>;
  dialogue: {
    greeting: string;
    personality_speech: string;
    farewell: string;
  };
}

/**
 * Object generation types
 */
export type ObjectType = 'weapon' | 'armor' | 'tool' | 'artifact' | 'consumable' | 'treasure';
export type ObjectRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GeneratedObject {
  name: string;
  type: string;
  rarity: string;
  description: string;
  properties: Array<{ name: string; effect: string; value?: number }>;
  lore: string;
  value: { gold: number; currency: string };
  requirements?: string[];
  imageUrl?: string | null;
}

/**
 * Location generation types
 */
export type LocationType = 'city' | 'village' | 'dungeon' | 'wilderness' | 'landmark' | 'building';

export interface GeneratedLocation {
  name: string;
  type: string;
  description: string;
  atmosphere: string;
  keyFeatures: string[];
  npcsPresent: Array<{ name: string; role: string; description: string }>;
  pointsOfInterest: Array<{ name: string; description: string; purpose: string }>;
  history: string;
  rumors: string[];
  imageUrl?: string | null;
}

/**
 * Map generation types
 */
export type MapType = 'world' | 'continent' | 'region' | 'city' | 'dungeon' | 'building';
export type MapSize = 'small' | 'medium' | 'large' | 'massive';

export interface GeneratedMap {
  name: string;
  type: string;
  size: string;
  description: string;
  dimensions: { width: number; height: number; scale: string };
  regions: Array<{
    name: string;
    type: string;
    coordinates: { x: number; y: number };
    size: string;
    description: string;
    features: string[];
  }>;
  landmarks: Array<{
    name: string;
    type: string;
    coordinates: { x: number; y: number };
    description: string;
    significance: string;
  }>;
  connections: Array<{
    from: string;
    to: string;
    type: 'road' | 'river' | 'path' | 'bridge' | 'tunnel';
    distance: string;
    difficulty?: string;
  }>;
}

/**
 * Story generation types
 */
export type StoryLength = 'short' | 'medium' | 'long' | 'novel';

export interface StoryCharacter {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface StoryWorldContext {
  setting: string;
  timeframe: string;
  worldDetails: string;
}

export interface StorySkillTarget {
  skill: string;
  currentLevel: number;
  targetLevel: number;
}

export interface GeneratedStory {
  id: string;
  title: string;
  description: string;
  synopsis: string;
  chapters: Array<{
    number: number;
    title: string;
    content: string;
    summary: string;
    skillsFocused?: string[];
    interactiveElements?: Array<Record<string, unknown>>;
    mediaContent?: { images: Array<Record<string, unknown>>; audio: Array<Record<string, unknown>> };
  }>;
  outline: Record<string, unknown>;
  characters: Array<Record<string, unknown>>;
  metadata: {
    genre: string;
    targetAudience: string;
    length: string;
    educationalLevel?: string;
    skillTargets?: Array<Record<string, unknown>>;
    tags: string[];
  };
  generationParams: Record<string, unknown>;
  generatedAt: string;
  aiModel: string;
  processingTime: number;
}

/**
 * Chapter generation context
 */
export interface ChapterContext {
  storyId: string;
  storyTitle: string;
  currentChapter: number;
  narrative: string;
  characters: StoryCharacter[];
  worldContext?: StoryWorldContext;
}

export interface GeneratedChapter {
  number: number;
  title: string;
  content: string;
  summary: string;
  skillsFocused?: string[];
  interactiveElements?: Array<Record<string, unknown>>;
  mediaContent?: { images: Array<Record<string, unknown>>; audio: Array<Record<string, unknown>> };
}

/**
 * Skill assessment types
 */
export type SkillLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';

export interface SkillAssessment {
  overall: { level: SkillLevel; score: number };
  vocabulary: { score: number; strengths?: string[]; improvements?: string[] };
  grammar: { score: number; strengths?: string[]; improvements?: string[] };
  narrative: { score: number; strengths?: string[]; improvements?: string[] };
  creativity: { score: number; strengths?: string[]; improvements?: string[] };
  style: { score: number; strengths?: string[]; improvements?: string[] };
  generatedAt: string;
}

export interface SkillAssessmentInput {
  overall: { level: string; score: number };
  vocabulary: { score: number };
  grammar: { score: number };
  narrative: { score: number };
  creativity: { score: number };
  style: { score: number };
}

/**
 * Educational feedback types
 */
export type FeedbackTone = 'encouraging' | 'constructive' | 'celebratory';

export interface EducationalFeedback {
  id: string;
  userId: string;
  overallTone: FeedbackTone;
  strengths: string[];
  improvements: string[];
  exercises: string[];
  encouragement: string;
  nextSteps: string[];
  skillProgression: Record<string, unknown>;
  generatedAt: string;
}

/**
 * Language options
 */
export type LanguageCode = 'ES' | 'EN';

// ============================================================================
// Error Handling
// ============================================================================

export class AIServicesError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'AIServicesError';
  }
}

// ============================================================================
// AI Services Client Class
// ============================================================================

export class AIServicesClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || AI_SERVICES_BASE_URL;
  }

  /**
   * Generic request handler
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new AIServicesError(
          data.error || `Request failed with status ${response.status}`,
          data.code,
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AIServicesError) {
        throw error;
      }
      throw new AIServicesError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        undefined,
        error
      );
    }
  }

  /**
   * Health check
   */
  async checkServicesHealth(): Promise<HealthStatus> {
    const response = await this.request<HealthStatus>('/healthCheck');
    if (!response.data) {
      throw new AIServicesError('No health data received', 'NO_DATA');
    }
    return response.data;
  }

  /**
   * Character generation using generic endpoint
   */
  async generateCharacter(prompt: string): Promise<GeneratedCharacter> {
    const response = await this.request<string>('/aiServices', {
      method: 'POST',
      body: JSON.stringify({
        service: 'character',
        operation: 'create',
        data: { prompt },
      }),
    });

    if (!response.data) {
      throw new AIServicesError('No character data received', 'NO_DATA');
    }

    try {
      const parsed = JSON.parse(response.data);
      return parsed.personaje_creado || parsed;
    } catch (error) {
      throw new AIServicesError('Failed to parse character data', 'PARSE_ERROR', undefined, error);
    }
  }

  /**
   * Character generation using dedicated endpoint
   */
  async generateCharacterDedicated(
    prompt: string,
    options?: { cached?: boolean }
  ): Promise<GeneratedCharacter> {
    const response = await this.request<string>('/generateCharacter', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options }),
    });

    if (!response.data) {
      throw new AIServicesError('No character data received', 'NO_DATA');
    }

    try {
      const parsed = JSON.parse(response.data);
      return parsed.personaje_creado || parsed;
    } catch (error) {
      throw new AIServicesError('Failed to parse character data', 'PARSE_ERROR', undefined, error);
    }
  }

  /**
   * Voice generation
   */
  async generateVoice(text: string, voiceConfig?: VoiceConfig): Promise<string> {
    const response = await this.request<string>('/aiServices', {
      method: 'POST',
      body: JSON.stringify({
        service: 'voice',
        operation: 'generate',
        data: { text, voiceConfig },
      }),
    });

    if (!response.data) {
      throw new AIServicesError('No audio data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Voice generation using dedicated endpoint
   */
  async generateVoiceDedicated(text: string, voiceConfig?: VoiceConfig): Promise<string> {
    const response = await this.request<string>('/generateVoice', {
      method: 'POST',
      body: JSON.stringify({ text, voiceConfig }),
    });

    if (!response.data) {
      throw new AIServicesError('No audio data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * World history generation
   */
  async generateWorldHistory(
    worldName: string,
    prompt: string,
    language?: LanguageCode
  ): Promise<WorldHistory> {
    const response = await this.request<WorldHistory>('/generateWorldHistory', {
      method: 'POST',
      body: JSON.stringify({ worldName, prompt, language }),
    });

    if (!response.data) {
      throw new AIServicesError('No world history data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Monster generation
   */
  async generateMonster(
    creatureName: string,
    type: string,
    language?: LanguageCode
  ): Promise<GeneratedMonster> {
    const response = await this.request<GeneratedMonster>('/generateMonster', {
      method: 'POST',
      body: JSON.stringify({ creatureName, type, language }),
    });

    if (!response.data) {
      throw new AIServicesError('No monster data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Mission generation
   */
  async generateMission(
    title: string,
    type: MissionType,
    difficulty: MissionDifficulty,
    setting: string,
    language?: LanguageCode
  ): Promise<GeneratedMission> {
    const response = await this.request<GeneratedMission>('/generateMission', {
      method: 'POST',
      body: JSON.stringify({ title, type, difficulty, setting, language }),
    });

    if (!response.data) {
      throw new AIServicesError('No mission data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * NPC generation
   */
  async generateNPC(
    race: string,
    occupation: string,
    personality: string,
    setting: string,
    name?: string,
    language?: LanguageCode
  ): Promise<GeneratedNPC> {
    const response = await this.request<GeneratedNPC>('/generateNPC', {
      method: 'POST',
      body: JSON.stringify({ name, race, occupation, personality, setting, language }),
    });

    if (!response.data) {
      throw new AIServicesError('No NPC data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Object generation
   */
  async generateObject(
    objectType: ObjectType,
    rarity: ObjectRarity,
    setting: string,
    theme?: string,
    language?: LanguageCode
  ): Promise<GeneratedObject> {
    const response = await this.request<GeneratedObject>('/generateObject', {
      method: 'POST',
      body: JSON.stringify({ objectType, rarity, setting, theme, language }),
    });

    if (!response.data) {
      throw new AIServicesError('No object data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Location generation
   */
  async generateLocation(
    locationName: string,
    locationType: LocationType,
    setting: string,
    mood?: string,
    climate?: string,
    language?: LanguageCode
  ): Promise<GeneratedLocation> {
    const response = await this.request<GeneratedLocation>('/generateLocation', {
      method: 'POST',
      body: JSON.stringify({ locationName, locationType, setting, mood, climate, language }),
    });

    if (!response.data) {
      throw new AIServicesError('No location data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Map generation
   */
  async generateMap(
    mapName: string,
    mapType: MapType,
    size: MapSize,
    biome?: string,
    theme?: string,
    language?: LanguageCode
  ): Promise<GeneratedMap> {
    const response = await this.request<GeneratedMap>('/generateMap', {
      method: 'POST',
      body: JSON.stringify({ mapName, mapType, size, biome, theme, language }),
    });

    if (!response.data) {
      throw new AIServicesError('No map data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Story generation
   */
  async generateStory(params: {
    initialPrompt: string;
    genre: string;
    targetAudience: string;
    length?: StoryLength;
    chapterCount?: number;
    characters?: StoryCharacter[];
    worldContext?: StoryWorldContext;
    skillTargets?: StorySkillTarget[];
    educationalGoals?: string[];
    includeImages?: boolean;
    includeAudio?: boolean;
    includeInteractive?: boolean;
  }): Promise<GeneratedStory> {
    const response = await this.request<GeneratedStory>('/generateStory', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!response.data) {
      throw new AIServicesError('No story data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Story generation using generic endpoint
   */
  async generateStoryGeneric(params: {
    initialPrompt: string;
    genre: string;
    targetAudience: string;
    length?: StoryLength;
    chapterCount?: number;
    characters?: StoryCharacter[];
    worldContext?: StoryWorldContext;
    skillTargets?: StorySkillTarget[];
    educationalGoals?: string[];
    includeImages?: boolean;
    includeAudio?: boolean;
    includeInteractive?: boolean;
  }): Promise<GeneratedStory> {
    const response = await this.request<GeneratedStory>('/aiServices', {
      method: 'POST',
      body: JSON.stringify({
        service: 'narrative',
        operation: 'generateStory',
        data: params,
      }),
    });

    if (!response.data) {
      throw new AIServicesError('No story data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Chapter generation
   */
  async generateChapter(context: ChapterContext): Promise<GeneratedChapter> {
    const response = await this.request<GeneratedChapter>('/generateChapter', {
      method: 'POST',
      body: JSON.stringify({ context }),
    });

    if (!response.data) {
      throw new AIServicesError('No chapter data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Chapter generation using generic endpoint
   */
  async generateChapterGeneric(context: ChapterContext): Promise<GeneratedChapter> {
    const response = await this.request<GeneratedChapter>('/aiServices', {
      method: 'POST',
      body: JSON.stringify({
        service: 'narrative',
        operation: 'generateChapter',
        data: { context },
      }),
    });

    if (!response.data) {
      throw new AIServicesError('No chapter data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Writing skills assessment
   */
  async assessSkills(text: string, userId: string): Promise<SkillAssessment> {
    const response = await this.request<SkillAssessment>('/assessSkills', {
      method: 'POST',
      body: JSON.stringify({ text, userId }),
    });

    if (!response.data) {
      throw new AIServicesError('No assessment data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Skills assessment using generic endpoint
   */
  async assessSkillsGeneric(text: string, userId: string): Promise<SkillAssessment> {
    const response = await this.request<SkillAssessment>('/aiServices', {
      method: 'POST',
      body: JSON.stringify({
        service: 'narrative',
        operation: 'assessSkills',
        data: { text, userId },
      }),
    });

    if (!response.data) {
      throw new AIServicesError('No assessment data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Educational feedback generation
   */
  async generateFeedback(
    text: string,
    skillAssessment: SkillAssessmentInput,
    userId: string
  ): Promise<EducationalFeedback> {
    const response = await this.request<EducationalFeedback>('/generateFeedback', {
      method: 'POST',
      body: JSON.stringify({ text, skillAssessment, userId }),
    });

    if (!response.data) {
      throw new AIServicesError('No feedback data received', 'NO_DATA');
    }

    return response.data;
  }

  /**
   * Educational feedback using generic endpoint
   */
  async generateFeedbackGeneric(
    text: string,
    skillAssessment: SkillAssessmentInput,
    userId: string
  ): Promise<EducationalFeedback> {
    const response = await this.request<EducationalFeedback>('/aiServices', {
      method: 'POST',
      body: JSON.stringify({
        service: 'narrative',
        operation: 'generateFeedback',
        data: { text, skillAssessment, userId },
      }),
    });

    if (!response.data) {
      throw new AIServicesError('No feedback data received', 'NO_DATA');
    }

    return response.data;
  }
}

// Export singleton instance
export const aiServicesClient = new AIServicesClient();