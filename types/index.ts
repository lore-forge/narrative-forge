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
  title?: string
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
  estimatedReadTime?: number
}

export interface GeneratedChapter {
  id: string
  chapterNumber: number
  title: string
  content: string
  summary?: string
  
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
  audioUrl?: string
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
  
  // Skills breakdown for progress tracking
  skills: {
    vocabulary: number
    grammar: number
    creativity: number
    structure: number
    characterDevelopment: number
  }
  
  // Writing statistics
  writingStats: {
    totalWords: number
    currentStreak: number
    longestStreak: number
    weeklyActivity: Record<string, number>
    averageSessionMinutes: number
    dailyActivity: Record<string, number>
  }
  
  // Goals (alias for writingGoals for component compatibility)
  goals: WritingGoal[]
}

// Alias for backwards compatibility
export type EducationalProgress = WritingProgress

// Multimedia types
export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: ImageStyle
  aspectRatio: string
  altText: string
  generatedAt: Date
  metadata?: {
    model: string
    seed?: number
    steps?: number
    guidance?: number
  }
}

export interface GeneratedAudio {
  id: string
  url: string
  text: string
  voice: VoiceProfile
  emotion: EmotionType
  duration: number
  generatedAt: Date
  metadata?: {
    model: string
    voice_id?: string
    emotion?: EmotionType
    speed?: number
  }
}

export interface AudioNarration {
  id: string
  chapterId: string
  segments: AudioSegment[]
  totalDuration: number
  downloadUrl: string
  url: string
  text: string
  voice: string
  duration: number
  generatedAt: Date
  metadata?: {
    model: string
    voice_id?: string
    emotion?: EmotionType
    speed?: number
  }
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
  prompt?: string
  
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
  avatar?: string
  isOnline?: boolean
  lastSeen?: Date
  cursor?: {
    position: number
    color: string
  }
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

// Additional missing types
export interface HistoricalEvent {
  id: string
  name: string
  description: string
  date: string
  significance: number
}

export interface Culture {
  id: string
  name: string
  description: string
  traditions: string[]
  values: string[]
}

export interface Religion {
  id: string
  name: string
  description: string
  deities: string[]
  practices: string[]
}

export interface Language {
  id: string
  name: string
  origin: string
  speakers: string[]
  characteristics: string[]
}

export interface Custom {
  id: string
  name: string
  description: string
  frequency: string
  culturalSignificance: number
}

export interface WorldNPC {
  id: string
  name: string
  description: string
  role: string
  location: string
}

export interface Map {
  id: string
  name: string
  type: string
  scale: string
  imageUrl: string
}

export interface CharacterDevelopment {
  characterId: string
  development: string
  significance: number
}

export interface PlotProgression {
  events: string[]
  significance: number
  tension: number
}

export interface SceneImage {
  id: string
  url: string
  description: string
  altText: string
  caption?: string
}

export interface Consequence {
  id: string
  description: string
  impact: number
}

export interface CharacterImpact {
  characterId: string
  impact: string
  value: number
}

export interface Permission {
  action: string
  allowed: boolean
}

export interface SkillTarget {
  skill: string
  level: number
}

export interface WritingGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  type?: string
  progress?: number
  unit?: string
  deadline?: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  unlockedAt: Date
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface GrammarSkill {
  level: number
  areas: string[]
  suggestions: string[]
}

export interface NarrativeSkill {
  level: number
  strengths: string[]
  improvements: string[]
}

export interface CreativitySkill {
  level: number
  originality: number
  imagination: number
}

export interface PlotElement {
  id: string
  type: string
  description: string
}

export interface BranchingChoice {
  id: string
  text: string
  consequence: string
}

export interface KnowledgeCheck {
  id: string
  question: string
  answer: string
  explanation: string
}

export interface Scene {
  id: string
  title: string
  description: string
  characters: string[]
}

export interface CharacterAction {
  characterId: string
  action: string
  outcome: string
}

export interface EducationalFeedback {
  id: string
  userId: string
  overallTone: string
  strengths: string[]
  improvements: string[]
  exercises: string[]
  encouragement: string
  nextSteps: string[]
  skillProgression: SkillAssessment
  generatedAt: Date
}

export interface CollaborativeSession {
  id: string
  storyId: string
  participants: Collaborator[]
  isActive: boolean
  createdAt: Date
  lastActivity: Date
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  content: string
  position: number
  timestamp: Date
  resolved: boolean
  userId?: string
  userName?: string
  resolvedBy?: string
  resolvedAt?: Date
}

export interface Change {
  id: string
  authorId: string
  type: 'insert' | 'delete' | 'format' | 'edit' | 'addition'
  content: string
  position: number
  timestamp: Date
  userId?: string
  userName?: string
  description?: string
  before?: string
  after?: string
}

export type PermissionLevel = 'view' | 'comment' | 'edit' | 'admin'

// AI Generation Request types
export interface ImageGenerationRequest {
  prompt: string
  style: ImageStyle
  aspectRatio: string
  quality: 'standard' | 'hd' | 'premium'
  ageAppropriate: boolean
  negativePrompt?: string
  seed?: number
  steps?: number
  guidance?: number
}

export interface AudioGenerationRequest {
  text: string
  voice: string
  speed: number
  emotion: EmotionType
  backgroundMusic: boolean
  language?: string
  accent?: string
}

export interface ReaderSettings {
  fontSize: number
  fontFamily: string
  theme: 'light' | 'dark' | 'sepia'
  backgroundColor: string
  textColor: string
  lineHeight: number
  columnWidth: 'single' | 'double'
  showProgress: boolean
  enableAudio: boolean
  autoBookmark: boolean
}