/**
 * AI Services API Client
 * 
 * A comprehensive TypeScript client for interacting with the Lore Forge AI Services Cloud Functions.
 * This module provides type-safe methods for health checks, character generation, and voice synthesis.
 * 
 * @module ai-services-api-client
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * Base URL for the AI Services Cloud Functions
 */
const AI_SERVICES_BASE_URL = 'https://us-central1-gen-lang-client-0780430254.cloudfunctions.net';

/**
 * API endpoints
 */
const ENDPOINTS = {
  HEALTH: '/ai-services-health',
  AI_SERVICES: '/ai-services'
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Generic API response structure returned by all AI services endpoints
 * @template T The type of data contained in the response
 */
export interface AIApiResponse<T = unknown> {
  /** Indicates whether the request was successful */
  success: boolean;
  /** The response data (present when success is true) */
  data?: T;
  /** Error message (present when success is false) */
  error?: string;
  /** Error code for specific error types */
  code?: string;
  /** ISO timestamp of when the response was generated */
  timestamp: string;
  /** Indicates if the response was served from cache */
  cached?: boolean;
  /** Source of the response (e.g., "ai-services-cloud-function") */
  source?: string;
}

/**
 * Health status response from the AI services health check endpoint
 */
export interface HealthStatus {
  /** Current status of the service */
  status: 'healthy' | 'unhealthy' | 'degraded';
  /** ISO timestamp of the health check */
  timestamp: string;
  /** Version of the AI services */
  version: string;
  /** List of available services */
  services: string[];
  /** Caching status */
  caching: 'enabled' | 'disabled';
}

/**
 * Voice configuration options for text-to-speech generation
 */
export interface VoiceConfig {
  /** Predefined character voice profile */
  characterId?: 'narrator' | 'merchant' | 'sage' | 'mysterious' | 'companion';
  /** Emotional tone for the voice */
  emotion?: 'neutral' | 'dramatic' | 'mysterious' | 'excited' | 'somber' | 'thoughtful';
  /** Custom SSML markup for advanced voice control */
  customSSML?: string;
  /** Language code (e.g., "en-US", "es-ES") */
  languageCode?: string;
  /** Specific voice name from the TTS provider */
  voiceName?: string;
}

/**
 * Generated character structure returned by the character generation service
 */
export interface GeneratedCharacter {
  /** Character's full name */
  nombre: string;
  /** Character's race or species */
  raza: string;
  /** Character's class or profession */
  clase: string;
  /** Character's age */
  edad: number;
  /** Character's primary motivations */
  motivaciones: string[];
  /** Physical appearance description */
  apariencia: {
    /** Height description */
    altura: string;
    /** Build/physique description */
    constitucion: string;
    /** Hair color and style */
    cabello: string;
    /** Eye color and characteristics */
    ojos: string;
    /** Distinguishing features */
    rasgos_distintivos: string[];
  };
  /** Personality traits and characteristics */
  personalidad: {
    /** Core personality traits */
    rasgos: string[];
    /** Personal ideals and beliefs */
    ideales: string[];
    /** Important bonds and relationships */
    vinculos: string[];
    /** Character flaws and weaknesses */
    defectos: string[];
  };
  /** Character's background story */
  historia: {
    /** Place of origin */
    origen: string;
    /** Key events in their past */
    eventos_importantes: string[];
    /** Current goals and objectives */
    objetivos_actuales: string[];
  };
  /** Character's abilities and skills */
  habilidades: {
    /** Combat abilities */
    combate: string[];
    /** Social skills */
    sociales: string[];
    /** Knowledge areas */
    conocimientos: string[];
    /** Special or unique abilities */
    especiales: string[];
  };
  /** Equipment and possessions */
  equipo: {
    /** Weapons carried */
    armas: string[];
    /** Armor and protective gear */
    armadura: string;
    /** Other important items */
    objetos_especiales: string[];
  };
  /** Character statistics */
  estadisticas: {
    /** Strength score */
    fuerza: number;
    /** Dexterity score */
    destreza: number;
    /** Constitution score */
    constitucion: number;
    /** Intelligence score */
    inteligencia: number;
    /** Wisdom score */
    sabiduria: number;
    /** Charisma score */
    carisma: number;
  };
}

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Custom error class for AI Services API errors
 */
export class AIServicesError extends Error {
  /** HTTP status code if available */
  public readonly statusCode?: number;
  /** API error code if provided */
  public readonly errorCode?: string;
  /** Original error object if available */
  public readonly originalError?: unknown;

  constructor(message: string, statusCode?: number, errorCode?: string, originalError?: unknown) {
    super(message);
    this.name = 'AIServicesError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.originalError = originalError;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Makes an HTTP request to the AI Services API
 * @param endpoint The API endpoint path
 * @param options Fetch options
 * @returns Promise resolving to the response data
 * @throws {AIServicesError} When the request fails
 */
async function makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${AI_SERVICES_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new AIServicesError(
        responseData.error || `HTTP error! status: ${response.status}`,
        response.status,
        responseData.code
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof AIServicesError) {
      throw error;
    }
    
    throw new AIServicesError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      undefined,
      error
    );
  }
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Checks the health status of the AI Services
 * 
 * @returns Promise resolving to the health status of all AI services
 * @throws {AIServicesError} When the health check fails or services are unhealthy
 * 
 * @example
 * ```typescript
 * try {
 *   const health = await checkServicesHealth();
 *   console.log(`Services are ${health.status}, version ${health.version}`);
 * } catch (error) {
 *   console.error('AI Services are not available:', error.message);
 * }
 * ```
 */
export async function checkServicesHealth(): Promise<HealthStatus> {
  const response = await makeRequest<HealthStatus>(ENDPOINTS.HEALTH, {
    method: 'GET',
  });

  if (response.status !== 'healthy') {
    throw new AIServicesError(
      `AI Services are ${response.status}`,
      503,
      'SERVICE_UNHEALTHY'
    );
  }

  return response;
}

/**
 * Generates a character based on a text prompt
 * 
 * @param prompt The character description prompt
 * @returns Promise resolving to the generated character object
 * @throws {AIServicesError} When character generation fails
 * 
 * @example
 * ```typescript
 * try {
 *   const character = await generateCharacter(
 *     "A wise elven wizard with a mysterious past"
 *   );
 *   console.log(`Created ${character.nombre}, a ${character.raza} ${character.clase}`);
 * } catch (error) {
 *   console.error('Failed to generate character:', error.message);
 * }
 * ```
 */
export async function generateCharacter(prompt: string): Promise<GeneratedCharacter> {
  if (!prompt || prompt.trim().length === 0) {
    throw new AIServicesError('Prompt cannot be empty', 400, 'INVALID_PROMPT');
  }

  const requestBody = {
    service: 'character',
    operation: 'create',
    data: {
      prompt: prompt.trim()
    }
  };

  const response = await makeRequest<AIApiResponse<string>>(ENDPOINTS.AI_SERVICES, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  if (!response.success) {
    throw new AIServicesError(
      response.error || 'Character generation failed',
      500,
      response.code || 'GENERATION_FAILED'
    );
  }

  if (!response.data) {
    throw new AIServicesError(
      'No character data received',
      500,
      'EMPTY_RESPONSE'
    );
  }

  try {
    // Parse the JSON string from the data field
    const parsedData = JSON.parse(response.data);
    
    // Extract the character from the parsed data
    if (parsedData.personaje_creado) {
      return parsedData.personaje_creado as GeneratedCharacter;
    }
    
    // If the structure is different, try to use the parsed data directly
    return parsedData as GeneratedCharacter;
  } catch (error) {
    throw new AIServicesError(
      'Failed to parse character data',
      500,
      'PARSE_ERROR',
      error
    );
  }
}

/**
 * Generates voice audio from text using text-to-speech
 * 
 * @param text The text to convert to speech
 * @param config Optional voice configuration settings
 * @returns Promise resolving to a base64-encoded audio data URL
 * @throws {AIServicesError} When voice generation fails
 * 
 * @example
 * ```typescript
 * try {
 *   const audioUrl = await generateVoice(
 *     "Welcome, brave adventurer!",
 *     {
 *       characterId: 'narrator',
 *       emotion: 'dramatic',
 *       languageCode: 'en-US'
 *     }
 *   );
 *   
 *   // Use the audio URL in an audio element
 *   const audio = new Audio(audioUrl);
 *   await audio.play();
 * } catch (error) {
 *   console.error('Failed to generate voice:', error.message);
 * }
 * ```
 */
export async function generateVoice(
  text: string,
  config?: VoiceConfig
): Promise<string> {
  if (!text || text.trim().length === 0) {
    throw new AIServicesError('Text cannot be empty', 400, 'INVALID_TEXT');
  }

  const requestBody = {
    service: 'voice',
    operation: 'generate',
    data: {
      text: text.trim(),
      voiceConfig: config
    }
  };

  const response = await makeRequest<AIApiResponse<string>>(ENDPOINTS.AI_SERVICES, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  if (!response.success) {
    throw new AIServicesError(
      response.error || 'Voice generation failed',
      500,
      response.code || 'GENERATION_FAILED'
    );
  }

  if (!response.data) {
    throw new AIServicesError(
      'No audio data received',
      500,
      'EMPTY_RESPONSE'
    );
  }

  // Validate that the response is a valid data URL
  if (!response.data.startsWith('data:audio/')) {
    throw new AIServicesError(
      'Invalid audio data format',
      500,
      'INVALID_AUDIO_FORMAT'
    );
  }

  return response.data;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates if a string is a valid base64 data URL
 * @param dataUrl The data URL to validate
 * @returns True if valid, false otherwise
 */
export function isValidAudioDataUrl(dataUrl: string): boolean {
  return /^data:audio\/[a-zA-Z0-9]+;base64,/.test(dataUrl);
}

/**
 * Extracts the MIME type from a data URL
 * @param dataUrl The data URL
 * @returns The MIME type or null if invalid
 */
export function extractMimeType(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([^;]+);/);
  return match ? match[1] : null;
}

/**
 * Creates an audio element from a base64 data URL
 * @param dataUrl The audio data URL
 * @returns HTMLAudioElement ready for playback
 */
export function createAudioElement(dataUrl: string): HTMLAudioElement {
  if (!isValidAudioDataUrl(dataUrl)) {
    throw new Error('Invalid audio data URL');
  }
  
  const audio = new Audio(dataUrl);
  audio.preload = 'auto';
  return audio;
}