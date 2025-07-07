# AI Services API Endpoints Documentation

This document provides a comprehensive overview of all available endpoints in the Lore Forge AI Services Cloud Functions API.

## Base URL
```
https://us-central1-gen-lang-client-0780430254.cloudfunctions.net/
```

## Common Response Format
All endpoints return responses in the following format:
```typescript
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  timestamp: string
  cached?: boolean
  source?: string
}
```

## Endpoints

### 1. Health Check
**Endpoint:** `/healthCheck`  
**Method:** `GET`  
**Description:** Check the health status of the AI services

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.1",
  "services": [
    "character", "voice", "world-history", "monster", 
    "mission", "npc", "object", "location", "map", "narrative"
  ],
  "caching": "disabled"
}
```

### 2. Character Generation
**Endpoint:** `/generateCharacter`  
**Method:** `POST`  
**Description:** Generate a character based on a text prompt

**Request Body:**
```typescript
{
  prompt: string           // Required: Character description prompt
  cached?: boolean         // Optional: Whether to use caching (default: true)
}
```

**Response:**
```typescript
{
  success: true,
  data: string,           // JSON string containing character data
  cached: boolean,
  timestamp: string
}
```

### 3. Voice Generation
**Endpoint:** `/generateVoice`  
**Method:** `POST`  
**Description:** Generate speech audio from text

**Request Body:**
```typescript
{
  text: string                    // Required: Text to convert to speech
  voiceConfig?: {                 // Optional: Voice configuration
    characterId?: "narrator" | "merchant" | "sage" | "mysterious" | "companion"
    emotion?: "neutral" | "dramatic" | "mysterious" | "excited" | "somber" | "thoughtful"
    customSSML?: string
    languageCode?: string
    voiceName?: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: string,           // Audio URL
  timestamp: string
}
```

### 4. World History Generation
**Endpoint:** `/generateWorldHistory`  
**Method:** `POST`  
**Description:** Generate comprehensive world history and lore

**Request Body:**
```typescript
{
  worldName: string       // Required: Name of the world
  prompt: string          // Required: World description prompt
  language?: "ES" | "EN"  // Optional: Language (default: "EN")
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    worldName: string,
    geography: {
      continents: Array<{ name: string; size: number; features: string[] }>,
      climateZones: Array<{ zone: string; description: string }>
    },
    cultures: Array<{ name: string; traits: string[]; traditions: string[] }>,
    historyHighlights: Array<{ event: string; year: number; description: string }>
  },
  timestamp: string
}
```

### 5. Monster Generation
**Endpoint:** `/generateMonster`  
**Method:** `POST`  
**Description:** Generate detailed monster/creature information

**Request Body:**
```typescript
{
  creatureName: string    // Required: Name of the creature
  type: string            // Required: Type of creature
  language?: "ES" | "EN"  // Optional: Language (default: "EN")
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    creatureName: string,
    type: string,
    description: string,
    abilities: Array<{ name: string; effect: string }>,
    habitat: string,
    imageUrl?: string | null
  },
  timestamp: string
}
```

### 6. Mission Generation
**Endpoint:** `/generateMission`  
**Method:** `POST`  
**Description:** Generate quest/mission content

**Request Body:**
```typescript
{
  title: string                                              // Required: Mission title
  type: "main" | "side" | "fetch" | "escort" | "combat" | "puzzle"  // Required
  difficulty: "easy" | "medium" | "hard" | "epic"           // Required
  setting: string                                            // Required: World/setting context
  language?: "ES" | "EN"                                    // Optional: Language (default: "EN")
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    title: string,
    type: string,
    difficulty: string,
    description: string,
    objectives: Array<{ id: string; description: string; completed: boolean }>,
    rewards: Array<{ 
      type: "experience" | "gold" | "item" | "reputation"; 
      amount: number; 
      description: string 
    }>,
    npcsInvolved: Array<{ name: string; role: string; location: string }>,
    estimatedDuration: string
  },
  timestamp: string
}
```

### 7. NPC Generation
**Endpoint:** `/generateNPC`  
**Method:** `POST`  
**Description:** Generate non-player character details

**Request Body:**
```typescript
{
  name?: string           // Optional: NPC name (will be generated if not provided)
  race: string            // Required: Character race
  occupation: string      // Required: Character occupation
  personality: string     // Required: Personality traits
  setting: string         // Required: World/setting context
  language?: "ES" | "EN"  // Optional: Language (default: "EN")
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    name: string,
    race: string,
    occupation: string,
    age: string,
    personality: {
      traits: string[],
      ideals: string[],
      bonds: string[],
      flaws: string[]
    },
    appearance: string,
    backstory: string,
    motivation: string,
    secrets: string[],
    relationships: Array<{ name: string; relationship: string; description: string }>,
    dialogue: {
      greeting: string,
      personality_speech: string,
      farewell: string
    }
  },
  timestamp: string
}
```

### 8. Object Generation
**Endpoint:** `/generateObject`  
**Method:** `POST`  
**Description:** Generate magical items, weapons, and artifacts

**Request Body:**
```typescript
{
  objectType: "weapon" | "armor" | "tool" | "artifact" | "consumable" | "treasure"  // Required
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"                     // Required
  setting: string                                                                     // Required
  theme?: string                                                                      // Optional
  language?: "ES" | "EN"                                                            // Optional
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    name: string,
    type: string,
    rarity: string,
    description: string,
    properties: Array<{ name: string; effect: string; value?: number }>,
    lore: string,
    value: { gold: number; currency: string },
    requirements?: string[],
    imageUrl?: string | null
  },
  timestamp: string
}
```

### 9. Location Description
**Endpoint:** `/generateLocation`  
**Method:** `POST`  
**Description:** Generate detailed location descriptions

**Request Body:**
```typescript
{
  locationName: string                                                               // Required
  locationType: "city" | "village" | "dungeon" | "wilderness" | "landmark" | "building"  // Required
  setting: string                                                                    // Required
  mood?: string                                                                      // Optional
  climate?: string                                                                   // Optional
  language?: "ES" | "EN"                                                           // Optional
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    name: string,
    type: string,
    description: string,
    atmosphere: string,
    keyFeatures: string[],
    npcsPresent: Array<{ name: string; role: string; description: string }>,
    pointsOfInterest: Array<{ name: string; description: string; purpose: string }>,
    history: string,
    rumors: string[],
    imageUrl?: string | null
  },
  timestamp: string
}
```

### 10. Map Generation
**Endpoint:** `/generateMap`  
**Method:** `POST`  
**Description:** Generate map layouts and regional details

**Request Body:**
```typescript
{
  mapName: string                                                                    // Required
  mapType: "world" | "continent" | "region" | "city" | "dungeon" | "building"      // Required
  size: "small" | "medium" | "large" | "massive"                                    // Required
  biome?: string                                                                     // Optional
  theme?: string                                                                     // Optional
  language?: "ES" | "EN"                                                           // Optional
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    name: string,
    type: string,
    size: string,
    description: string,
    dimensions: { width: number; height: number; scale: string },
    regions: Array<{
      name: string,
      type: string,
      coordinates: { x: number; y: number },
      size: string,
      description: string,
      features: string[]
    }>,
    landmarks: Array<{
      name: string,
      type: string,
      coordinates: { x: number; y: number },
      description: string,
      significance: string
    }>,
    connections: Array<{
      from: string,
      to: string,
      type: "road" | "river" | "path" | "bridge" | "tunnel",
      distance: string,
      difficulty?: string
    }>
  },
  timestamp: string
}
```

### 11. Story Generation
**Endpoint:** `/generateStory`  
**Method:** `POST`  
**Description:** Generate complete narrative stories

**Request Body:**
```typescript
{
  initialPrompt: string                              // Required: Story premise
  genre: string                                      // Required: Story genre
  targetAudience: string                             // Required: Target audience
  length?: "short" | "medium" | "long" | "novel"    // Optional
  chapterCount?: number                              // Optional
  characters?: Array<{                               // Optional
    id: string,
    name: string,
    role: string,
    description: string
  }>,
  worldContext?: {                                   // Optional
    setting: string,
    timeframe: string,
    worldDetails: string
  },
  skillTargets?: Array<{                             // Optional
    skill: string,
    currentLevel: number,
    targetLevel: number
  }>,
  educationalGoals?: string[],                       // Optional
  includeImages?: boolean,                           // Optional
  includeAudio?: boolean,                            // Optional
  includeInteractive?: boolean                       // Optional
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    description: string,
    synopsis: string,
    chapters: Array<{
      number: number,
      title: string,
      content: string,
      summary: string,
      skillsFocused?: string[],
      interactiveElements?: any[],
      mediaContent?: { images: any[], audio: any[] }
    }>,
    outline: any,
    characters: any[],
    metadata: {
      genre: string,
      targetAudience: string,
      length: string,
      educationalLevel?: string,
      skillTargets?: any[],
      tags: string[]
    },
    generationParams: any,
    generatedAt: string,
    aiModel: string,
    processingTime: number
  },
  source: "ai-services-cloud-function",
  timestamp: string
}
```

### 12. Chapter Generation
**Endpoint:** `/generateChapter`  
**Method:** `POST`  
**Description:** Generate individual story chapters

**Request Body:**
```typescript
{
  context: {                        // Required
    storyId: string,               // Required
    storyTitle: string,            // Required
    currentChapter: number,        // Required
    narrative: string,             // Required: Previous narrative context
    characters: Array<{            // Required
      id: string,
      name: string,
      role: string,
      description: string
    }>,
    worldContext?: {               // Optional
      setting: string,
      timeframe: string,
      worldDetails: string
    }
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    number: number,
    title: string,
    content: string,
    summary: string,
    skillsFocused?: string[],
    interactiveElements?: any[],
    mediaContent?: { images: any[], audio: any[] }
  },
  source: "ai-services-cloud-function",
  timestamp: string
}
```

### 13. Writing Skills Assessment
**Endpoint:** `/assessSkills`  
**Method:** `POST`  
**Description:** Analyze text for writing skill assessment

**Request Body:**
```typescript
{
  text: string,      // Required: Text to analyze
  userId: string     // Required: User identifier
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    overall: { 
      level: "beginner" | "elementary" | "intermediate" | "advanced" | "expert", 
      score: number 
    },
    vocabulary: { score: number, strengths?: string[], improvements?: string[] },
    grammar: { score: number, strengths?: string[], improvements?: string[] },
    narrative: { score: number, strengths?: string[], improvements?: string[] },
    creativity: { score: number, strengths?: string[], improvements?: string[] },
    style: { score: number, strengths?: string[], improvements?: string[] },
    generatedAt: string
  },
  source: "ai-services-cloud-function",
  timestamp: string
}
```

### 14. Educational Feedback
**Endpoint:** `/generateFeedback`  
**Method:** `POST`  
**Description:** Generate personalized educational feedback

**Request Body:**
```typescript
{
  text: string,                    // Required: Student's text
  skillAssessment: {               // Required: Previous assessment
    overall: { level: string, score: number },
    vocabulary: { score: number },
    grammar: { score: number },
    narrative: { score: number },
    creativity: { score: number },
    style: { score: number }
  },
  userId: string                   // Required: User identifier
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    userId: string,
    overallTone: "encouraging" | "constructive" | "celebratory",
    strengths: string[],
    improvements: string[],
    exercises: string[],
    encouragement: string,
    nextSteps: string[],
    skillProgression: any,
    generatedAt: string
  },
  source: "ai-services-cloud-function",
  timestamp: string
}
```

### 15. Generic AI Services
**Endpoint:** `/aiServices`  
**Method:** `POST`  
**Description:** Generic endpoint for accessing various AI services

**Request Body:**
```typescript
{
  service: string,       // Required: Service name ("character", "voice", "narrative")
  operation: string,     // Required: Operation name
  data: any             // Required: Service-specific data
}
```

**Supported Operations:**
- `service: "character", operation: "create"` - Same as generateCharacter
- `service: "voice", operation: "generate"` - Same as generateVoice
- `service: "narrative", operation: "generateStory"` - Same as generateStory
- `service: "narrative", operation: "generateChapter"` - Same as generateChapter
- `service: "narrative", operation: "assessSkills"` - Same as assessSkills
- `service: "narrative", operation: "generateFeedback"` - Same as generateFeedback

## Error Responses

All endpoints may return error responses in the following format:

```typescript
{
  success: false,
  error: string,        // Error message
  code?: string,        // Error code
  timestamp: string
}
```

Common HTTP status codes:
- `400` - Bad Request (missing or invalid parameters)
- `500` - Internal Server Error (service failure)

## CORS Support

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Authentication

Currently, the endpoints are publicly accessible. Future versions may require authentication headers.

## Rate Limiting

No rate limiting is currently implemented. Please use responsibly.

## Caching

Caching is currently disabled across all services. The `cached` parameter in responses will always be `false`.