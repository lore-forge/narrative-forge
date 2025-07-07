// Core story types
export interface Story {
  id: string
  userId: string
  title: string
  description: string
  genre: Genre
  targetAudience: AudienceLevel
  status: StoryStatus
  
  // Content
  chapters: Chapter[]
  plotOutline: PlotStructure
  characters: StoryCharacter[]
  
  // Integration
  importedCharacters: ImportedCharacter[]
  worldId?: string
  baseAdventureId?: string
  
  // Metadata
  wordCount: number
  estimatedReadingTime: number
  complexity: number
  themes: string[]
  
  // Collaboration
  collaborators: Collaborator[]
  permissions: StoryPermissions
  
  // Multimedia
  coverImage?: GeneratedImage
  audioNarration?: GeneratedAudio[]
  
  createdAt: Date
  updatedAt: Date
}

export interface Chapter {
  id: string
  storyId: string
  title: string
  content: string
  orderIndex: number
  
  // AI generation metadata
  generationPrompt?: string
  aiModel?: string
  generatedAt?: Date
  
  // Plot elements
  plotElements: PlotElement[]
  characters: string[] // Character IDs appearing in chapter
  locations: string[] // Location IDs from World Builder
  
  // Multimedia
  images?: GeneratedImage[]
  audioNarration?: GeneratedAudio
  branchingOptions?: BranchingChoice[] // For interactive stories
  
  // Educational
  complexityLevel: number
  skillTargets: string[]
  knowledgeChecks?: KnowledgeCheck[]
  
  createdAt: Date
  updatedAt: Date
}

export interface StoryCharacter {
  id: string
  sourceCharacterId?: string // From RPG Immersive
  sourceModule?: 'rpg-immersive' | 'original'
  
  // Basic info
  name: string
  description: string
  background: string
  appearance: string
  
  // Personality
  personality: PersonalityProfile
  voiceProfile?: VoiceProfile
  narrativeRole: NarrativeRole
  dialogueStyle: string
  
  // Character development
  characterArc?: CharacterArc
  relationships: CharacterRelationship[]
  
  // Synchronization
  lastSync?: Date
  syncEnabled: boolean
}

export interface PersonalityProfile {
  traits: string[]
  motivations: string[]
  fears: string[]
  ideals: string[]
  confidence: number
  intelligence: number
  physicality: number
  dominantEmotion?: EmotionType
}

export interface PlotStructure {
  storyArc: 'three-act' | 'heroes-journey' | 'freytag-pyramid' | 'custom'
  exposition: PlotPoint
  incitingIncident: PlotPoint
  plotPoints: PlotPoint[]
  climax: PlotPoint
  resolution: PlotPoint
  themes: Theme[]
  characterArcs: CharacterArc[]
}

export interface PlotPoint {
  id: string
  title: string
  description: string
  type: PlotPointType
  chapterIndex?: number
  characters: string[]
  significance: number
}

export interface WorldContext {
  id: string
  name: string
  description: string
  genre: Genre
  
  locations: WorldLocation[]
  npcs: WorldNPC[]
  lore: WorldLore
  timeline: TimelineEvent[]
  
  maps?: Map[]
  images?: GeneratedImage[]
}

export interface WorldLocation {
  id: string
  name: string
  description: string
  type: string
  connections: string[]
  mood: string
  pointsOfInterest: string[]
}

export interface ImportedCharacter {
  originalId: string
  sourceModule: 'rpg-immersive' | 'world-builder'
  importedAt: Date
  storyCharacter: StoryCharacter
}

// AI and Generation types
export interface StoryGenerationRequest {
  initialPrompt: string
  genre: Genre
  targetAudience: AudienceLevel
  length: StoryLength
  style?: WritingStyle
  perspective?: NarrativePerspective
  tense?: NarrativeTense
  
  // Integration options
  characters?: StoryCharacter[]
  worldContext?: WorldContext
  baseAdventure?: Adventure
  
  // Generation options
  chapterCount?: number
  includeImages?: boolean
  includeAudio?: boolean
  includeInteractive?: boolean
  
  // Educational options
  skillTargets?: SkillTarget[]
  educationalGoals?: string[]
}

export interface GeneratedStory {
  id: string
  title: string
  description: string
  synopsis: string
  
  chapters: GeneratedChapter[]
  outline: PlotStructure
  characters: StoryCharacter[]
  
  metadata: StoryMetadata
  generationParams: StoryGenerationRequest
  
  generatedAt: Date
  aiModel: string
  processingTime: number
}

export interface GeneratedChapter {
  id: string
  chapterNumber: number
  title: string
  content: string
  
  // Generation metadata
  prompt: string
  focusCharacter?: string
  wordCount: number
  mood: string
  
  // Development tracking
  characterDevelopment?: CharacterDevelopment[]
  plotProgression: PlotProgression
  
  // Multimedia
  images?: SceneImage[]
  audioNarration?: AudioNarration
  interactiveElements?: InteractiveElement[]
}

// Educational types
export interface SkillAssessment {
  userId: string
  assessmentDate: Date
  
  vocabulary: VocabularySkill
  grammar: GrammarSkill
  narrative: NarrativeSkill
  creativity: CreativitySkill
  
  overallLevel: SkillLevel
  improvementAreas: string[]
  strengths: string[]
  nextGoals: string[]
}

export interface VocabularySkill {
  level: number // 1-10 scale
  complexity: number
  diversity: number
  suggestions: string[]
}

export interface WritingProgress {
  userId: string
  currentLevel: SkillLevel
  skillAssessments: SkillAssessment[]
  completedStories: string[]
  writingGoals: WritingGoal[]
  achievements: Achievement[]
  lastAssessment: Date
}

// Multimedia types
export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: ImageStyle
  aspectRatio: string
  altText: string
  generatedAt: Date
}

export interface GeneratedAudio {
  id: string
  url: string
  text: string
  voice: VoiceProfile
  emotion: EmotionType
  duration: number
  generatedAt: Date
}

export interface AudioNarration {
  id: string
  chapterId: string
  segments: AudioSegment[]
  totalDuration: number
  downloadUrl: string
}

export interface AudioSegment {
  type: 'narration' | 'dialogue'
  characterId?: string
  characterName?: string
  audioUrl: string
  duration: number
  text: string
}

// Interactive elements
export interface InteractiveElement {
  id: string
  type: 'choice' | 'knowledge-check' | 'character-interaction'
  position: number // Position in chapter text
  description: string
  
  choices?: Choice[]
  consequences?: Consequence[]
  correctAnswer?: string
  explanation?: string
}

export interface Choice {
  id: string
  text: string
  consequence: string
  nextChapterId?: string
  characterImpact?: CharacterImpact[]
}

// Collaboration types
export interface Collaborator {
  userId: string
  name: string
  email: string
  role: CollaboratorRole
  permissions: Permission[]
  joinedAt: Date
}

export interface StoryPermissions {
  isPublic: boolean
  allowComments: boolean
  allowForks: boolean
  editPermissions: 'owner' | 'collaborators' | 'public'
  viewPermissions: 'private' | 'collaborators' | 'public'
}

// Enums and types
export type Genre = 
  | 'fantasy' 
  | 'science-fiction' 
  | 'mystery' 
  | 'adventure' 
  | 'historical' 
  | 'contemporary' 
  | 'horror' 
  | 'romance' 
  | 'thriller'

export type AudienceLevel = 
  | 'child' // 8-10
  | 'preteen' // 11-12
  | 'teen' // 13-14
  | 'young-adult' // 15-18
  | 'adult' // 18+

export type StoryStatus = 
  | 'draft' 
  | 'in-progress' 
  | 'completed' 
  | 'published' 
  | 'archived'

export type StoryLength = 
  | 'short' // 1-3 chapters, <5k words
  | 'medium' // 4-8 chapters, 5k-15k words
  | 'long' // 9-15 chapters, 15k-35k words
  | 'novel' // 16+ chapters, 35k+ words

export type NarrativeRole = 
  | 'protagonist' 
  | 'antagonist' 
  | 'supporting' 
  | 'comic-relief' 
  | 'mentor' 
  | 'love-interest'

export type PlotPointType = 
  | 'exposition'
  | 'inciting-incident'
  | 'rising-action'
  | 'climax'
  | 'falling-action'
  | 'resolution'
  | 'plot-twist'

export type EmotionType = 
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'neutral'
  | 'excitement'
  | 'determination'

export type SkillLevel = 
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'advanced'
  | 'expert'

export type CollaboratorRole = 
  | 'owner'
  | 'editor'
  | 'commenter'
  | 'viewer'

export type NarrativePerspective = 
  | 'first-person'
  | 'second-person'
  | 'third-person-limited'
  | 'third-person-omniscient'

export type NarrativeTense = 
  | 'past'
  | 'present'
  | 'future'

export type ImageStyle = 
  | 'realistic'
  | 'fantasy-art'
  | 'cartoon'
  | 'watercolor'
  | 'sketch'
  | 'digital-art'

// Additional interfaces for complex types
export interface WritingStyle {
  name: string
  tone: string
  sentenceStructure: string
  vocabularyLevel: string
  narrativeVoice: string
}

export interface VoiceProfile {
  id: string
  name: string
  gender: 'male' | 'female' | 'neutral'
  age: 'child' | 'teen' | 'adult' | 'elderly'
  accent?: string
  pace: 'slow' | 'normal' | 'fast'
  pitch: 'low' | 'normal' | 'high'
}

export interface Theme {
  name: string
  description: string
  prominence: number // 1-10 scale
}

export interface CharacterArc {
  characterId: string
  startingPoint: string
  developmentPoints: string[]
  climaxPoint: string
  resolution: string
  growthMeasurement: number
}

export interface CharacterRelationship {
  characterId: string
  relationshipType: 'friend' | 'enemy' | 'family' | 'romantic' | 'mentor' | 'rival'
  strength: number // 1-10 scale
  description: string
}

export interface StoryMetadata {
  wordCount: number
  estimatedReadingTime: number
  complexity: number
  themes: string[]
  contentWarnings: string[]
  educationalValue: number
}

export interface WorldLore {
  history: HistoricalEvent[]
  cultures: Culture[]
  religions: Religion[]
  languages: Language[]
  customs: Custom[]
}

export interface TimelineEvent {
  id: string
  name: string
  description: string
  date: string
  importance: number
}

export interface Adventure {
  id: string
  title: string
  description: string
  sessions: GameSession[]
  characters: string[]
}

export interface GameSession {
  id: string
  sessionNumber: number
  title?: string
  transcript: string
  scenes: Scene[]
  characterActions: CharacterAction[]
  mood?: string
}

// Utility types
export interface StoryContext {
  storyId: string
  characters: StoryCharacter[]
  plotEvents: PlotEvent[]
  worldElements: WorldElement[]
  continuity: ContinuityElement[]
  currentChapter: number
  narrative: string
}

export interface PlotEvent {
  id: string
  description: string
  type: string
  characters: string[]
  location?: string
  significance: number
  timestamp: Date
}

export interface WorldElement {
  id: string
  type: 'location' | 'character' | 'object' | 'concept'
  name: string
  description: string
  properties: Record<string, any>
}

export interface ContinuityElement {
  id: string
  type: 'character-trait' | 'world-rule' | 'plot-point' | 'relationship'
  description: string
  established: Date
  references: string[] // Chapter IDs where this is referenced
}