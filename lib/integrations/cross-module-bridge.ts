import { adminDb, adminAuth } from '@/lib/firebase/config'
import type { 
  StoryCharacter, 
  WorldContext, 
  Adventure,
  ImportedCharacter
} from '@/types'

// Temporary type definitions for cross-module types not yet implemented
interface RPGCharacter {
  id: string;
  name: string;
  class: string;
  race: string;
  level: number;
  description: string;
  stats: any;
  equipment: any;
  imageUrl?: string;
  campaign?: string;
}

interface WorldBuilderWorld {
  id: string;
  name: string;
  description: string;
  regions: any[];
  lore: any;
}

/**
 * Cross-Module Integration Bridge Service
 * 
 * Handles communication and data synchronization between Narrative Forge
 * and other Lore Forge ecosystem modules (RPG Immersive, World Builder)
 */
export class CrossModuleBridge {
  private static instance: CrossModuleBridge
  
  public static getInstance(): CrossModuleBridge {
    if (!CrossModuleBridge.instance) {
      CrossModuleBridge.instance = new CrossModuleBridge()
    }
    return CrossModuleBridge.instance
  }

  /**
   * RPG IMMERSIVE INTEGRATION
   */

  /**
   * Fetch all characters belonging to a user from RPG Immersive
   */
  async getRPGCharacters(userId: string): Promise<RPGCharacter[]> {
    try {
      // Validate user authentication
      await this.validateUser(userId)

      // Query the RPG Immersive characters collection
      const charactersRef = adminDb.collection('characters')
      const snapshot = await charactersRef.where('userId', '==', userId).get()

      if (snapshot.empty) {
        console.log(`No RPG characters found for user ${userId}`)
        return []
      }

      const characters: RPGCharacter[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        
        // Transform RPG character data to our expected format
        const character: RPGCharacter = {
          id: doc.id,
          name: data.name || 'Unnamed Character',
          class: data.class || 'Unknown',
          race: data.race || 'Unknown',
          level: data.level || 1,
          description: data.description || data.backstory || '',
          stats: {
            strength: data.stats?.strength || data.attributes?.strength || 10,
            dexterity: data.stats?.dexterity || data.attributes?.dexterity || 10,
            constitution: data.stats?.constitution || data.attributes?.constitution || 10,
            intelligence: data.stats?.intelligence || data.attributes?.intelligence || 10,
            wisdom: data.stats?.wisdom || data.attributes?.wisdom || 10,
            charisma: data.stats?.charisma || data.attributes?.charisma || 10
          },
          equipment: data.equipment || data.inventory || {},
          imageUrl: data.imageUrl || data.portraitUrl,
          campaign: data.campaign || data.adventureName
        }

        characters.push(character)
      })

      console.log(`✅ Loaded ${characters.length} RPG characters for user ${userId}`)
      return characters

    } catch (error) {
      console.error('❌ Failed to fetch RPG characters:', error)
      throw new Error(`Failed to load RPG characters: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Convert RPG character to Story character format
   */
  async importRPGCharacter(characterId: string, userId: string): Promise<StoryCharacter> {
    try {
      // Validate user authentication
      await this.validateUser(userId)

      // Fetch the specific character
      const characterRef = adminDb.collection('characters').doc(characterId)
      const characterDoc = await characterRef.get()

      if (!characterDoc.exists) {
        throw new Error(`Character ${characterId} not found`)
      }

      const data = characterDoc.data()!

      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to character')
      }

      // Convert to story character format
      const storyCharacter: StoryCharacter = {
        id: `story-${characterId}`,
        sourceCharacterId: characterId,
        sourceModule: 'rpg-immersive',
        name: data.name,
        description: data.description || data.backstory || '',
        background: this.generateCharacterBackground(data),
        appearance: data.appearance || this.generateAppearanceFromRace(data.race),
        personality: this.extractPersonalityFromRPGStats(data),
        voiceProfile: this.generateVoiceProfile(data),
        narrativeRole: this.determineNarrativeRole(data),
        dialogueStyle: this.generateDialogueStyle(data),
        relationships: [],
        lastSync: new Date(),
        syncEnabled: true
      }

      // Store the imported character in Narrative Forge
      await this.saveImportedCharacter(userId, storyCharacter)

      console.log(`✅ Successfully imported character ${data.name} for user ${userId}`)
      return storyCharacter

    } catch (error) {
      console.error('❌ Failed to import RPG character:', error)
      throw new Error(`Failed to import character: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Monitor RPG character changes and sync with stories
   */
  async syncCharacterUpdates(characterId: string, userId: string): Promise<void> {
    try {
      // Find all stories using this character
      const storiesRef = adminDb.collection('narrative_stories')
      const storiesSnapshot = await storiesRef
        .where('userId', '==', userId)
        .where('importedCharacters', 'array-contains', { sourceCharacterId: characterId })
        .get()

      if (storiesSnapshot.empty) {
        console.log(`No stories using character ${characterId} found`)
        return
      }

      // Get updated character data
      const updatedCharacter = await this.importRPGCharacter(characterId, userId)

      // Update each story
      const batch = adminDb.batch()
      storiesSnapshot.forEach(doc => {
        const storyData = doc.data()
        const updatedCharacters = storyData.importedCharacters.map((char: any) => 
          char.sourceCharacterId === characterId ? updatedCharacter : char
        )

        batch.update(doc.ref, { 
          importedCharacters: updatedCharacters,
          updatedAt: new Date()
        })
      })

      await batch.commit()
      console.log(`✅ Synced character ${characterId} across ${storiesSnapshot.size} stories`)

    } catch (error) {
      console.error('❌ Failed to sync character updates:', error)
      throw new Error(`Character sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * WORLD BUILDER INTEGRATION
   */

  /**
   * Fetch all worlds belonging to a user from World Builder
   */
  async getWorldBuilderWorlds(userId: string): Promise<WorldBuilderWorld[]> {
    try {
      // Validate user authentication
      await this.validateUser(userId)

      // Query the World Builder worlds collection
      const worldsRef = adminDb.collection('worlds')
      const snapshot = await worldsRef.where('userId', '==', userId).get()

      if (snapshot.empty) {
        console.log(`No worlds found for user ${userId}`)
        return []
      }

      const worlds: WorldBuilderWorld[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        
        const world: WorldBuilderWorld = {
          id: doc.id,
          name: data.name || 'Unnamed World',
          description: data.description || '',
          regions: data.regions || data.locations || [],
          lore: data.lore || {}
        }

        worlds.push(world)
      })

      console.log(`✅ Loaded ${worlds.length} worlds for user ${userId}`)
      return worlds

    } catch (error) {
      console.error('❌ Failed to fetch worlds:', error)
      throw new Error(`Failed to load worlds: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Import world context for storytelling
   */
  async importWorldContext(worldId: string, userId: string): Promise<WorldContext> {
    try {
      // Validate user authentication
      await this.validateUser(userId)

      // Fetch the specific world
      const worldRef = adminDb.collection('worlds').doc(worldId)
      const worldDoc = await worldRef.get()

      if (!worldDoc.exists) {
        throw new Error(`World ${worldId} not found`)
      }

      const data = worldDoc.data()!

      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to world')
      }

      // Convert to world context format
      const worldContext: WorldContext = {
        id: worldId,
        name: data.name,
        description: data.description,
        genre: data.genre,
        locations: this.processWorldLocations(data.locations || []),
        npcs: this.processWorldNPCs(data.npcs || []),
        lore: this.processWorldLore(data.lore || {}),
        timeline: this.processWorldTimeline(data.timeline || []),
        maps: data.maps || [],
        images: data.images || []
      }

      console.log(`✅ Successfully imported world ${data.name} for user ${userId}`)
      return worldContext

    } catch (error) {
      console.error('❌ Failed to import world:', error)
      throw new Error(`Failed to import world: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * ADVENTURE ADAPTATION
   */

  /**
   * Convert RPG adventure/session to story outline
   */
  async adaptAdventureToStory(adventureId: string, userId: string): Promise<any> {
    try {
      // Validate user authentication
      await this.validateUser(userId)

      // Fetch adventure data
      const adventureRef = adminDb.collection('adventures').doc(adventureId)
      const adventureDoc = await adventureRef.get()

      if (!adventureDoc.exists) {
        throw new Error(`Adventure ${adventureId} not found`)
      }

      const adventureData = adventureDoc.data()!

      // Verify ownership
      if (adventureData.userId !== userId) {
        throw new Error('Unauthorized access to adventure')
      }

      // Fetch associated sessions
      const sessionsRef = adminDb.collection('game_sessions')
      const sessionsSnapshot = await sessionsRef
        .where('adventureId', '==', adventureId)
        .orderBy('sessionNumber')
        .get()

      const sessions: any[] = []
      sessionsSnapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() })
      })

      // Convert to story format
      const adaptedStory = {
        title: adventureData.title || 'Adapted Adventure',
        description: adventureData.description || '',
        sourceAdventureId: adventureId,
        adaptationMethod: 'rpg-session',
        originalSessions: sessions.length,
        chapters: sessions.map((session, index) => ({
          title: session.title || `Chapter ${index + 1}`,
          content: this.convertSessionToNarrative(session),
          sessionId: session.id,
          sessionNumber: session.sessionNumber
        })),
        characters: await this.extractCharactersFromSessions(sessions, userId),
        timeline: this.generateTimelineFromSessions(sessions),
        gameElements: {
          diceRolls: this.extractSignificantRolls(sessions),
          combatEncounters: this.extractCombats(sessions),
          characterDecisions: this.extractDecisions(sessions)
        }
      }

      console.log(`✅ Successfully adapted adventure ${adventureData.title} to story format`)
      return adaptedStory

    } catch (error) {
      console.error('❌ Failed to adapt adventure:', error)
      throw new Error(`Adventure adaptation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * HELPER METHODS
   */

  private async validateUser(userId: string): Promise<void> {
    try {
      await adminAuth.getUser(userId)
    } catch (error) {
      throw new Error('Invalid or unauthorized user')
    }
  }

  private async saveImportedCharacter(userId: string, character: StoryCharacter): Promise<void> {
    const importedCharacterRef = adminDb.collection('narrative_story_characters').doc()
    await importedCharacterRef.set({
      userId,
      character,
      importedAt: new Date(),
      lastSync: new Date()
    })
  }

  private generateCharacterBackground(rpgData: any): string {
    const level = rpgData.level || 1
    const charClass = rpgData.class || 'Adventurer'
    const race = rpgData.race || 'Unknown'
    const campaign = rpgData.campaign || 'a distant land'
    
    return `A level ${level} ${race} ${charClass} who has journeyed from ${campaign}, carrying the wisdom and scars of their adventures.`
  }

  private generateAppearanceFromRace(race: string): string {
    const raceDescriptions: Record<string, string> = {
      'human': 'Average height with diverse features reflecting their human heritage',
      'elf': 'Tall and graceful with pointed ears and an otherworldly beauty',
      'dwarf': 'Sturdy and strong with a magnificent beard and weathered hands',
      'halfling': 'Small in stature but large in heart, with curly hair and bright eyes',
      'dragonborn': 'Imposing figure with draconic features and scales that shimmer in the light',
      'tiefling': 'Striking appearance with horns, tail, and eyes that hint at infernal heritage'
    }
    
    return raceDescriptions[race.toLowerCase()] || 'Distinctive features that reflect their unique heritage'
  }

  private extractPersonalityFromRPGStats(rpgData: any): any {
    const stats = rpgData.stats || rpgData.attributes || {}
    
    return {
      traits: this.generateTraitsFromStats(stats, rpgData.class),
      motivations: this.generateMotivationsFromClass(rpgData.class),
      fears: ['Failing their companions', 'Losing their identity'],
      ideals: this.generateIdealsFromStats(stats),
      confidence: (stats.charisma || 10) / 20,
      intelligence: (stats.intelligence || 10) / 20,
      physicality: (stats.strength || 10) / 20,
      dominantEmotion: this.getDominantEmotionFromClass(rpgData.class)
    }
  }

  private generateTraitsFromStats(stats: any, charClass: string): string[] {
    const traits = []
    
    if (stats.strength > 15) traits.push('Strong', 'Protective')
    if (stats.intelligence > 15) traits.push('Intelligent', 'Analytical')
    if (stats.wisdom > 15) traits.push('Wise', 'Perceptive')
    if (stats.charisma > 15) traits.push('Charismatic', 'Persuasive')
    if (stats.dexterity > 15) traits.push('Agile', 'Quick-thinking')
    if (stats.constitution > 15) traits.push('Resilient', 'Determined')
    
    // Class-based traits
    const classTraits: Record<string, string[]> = {
      'fighter': ['Brave', 'Disciplined'],
      'wizard': ['Studious', 'Curious'],
      'rogue': ['Cunning', 'Resourceful'],
      'cleric': ['Devout', 'Compassionate'],
      'ranger': ['Independent', 'Nature-loving'],
      'bard': ['Creative', 'Sociable']
    }
    
    if (charClass && classTraits[charClass.toLowerCase()]) {
      traits.push(...classTraits[charClass.toLowerCase()])
    }
    
    return traits.slice(0, 4)
  }

  private generateMotivationsFromClass(charClass: string): string[] {
    const classMotivations: Record<string, string[]> = {
      'fighter': ['Protect the innocent', 'Prove their strength'],
      'wizard': ['Uncover ancient knowledge', 'Master their craft'],
      'rogue': ['Seek fortune', 'Right past wrongs'],
      'cleric': ['Serve their deity', 'Heal the suffering'],
      'ranger': ['Protect nature', 'Hunt dangerous beasts'],
      'bard': ['Share stories', 'Inspire others']
    }
    
    return classMotivations[charClass?.toLowerCase()] || ['Find their destiny', 'Make a difference']
  }

  private generateIdealsFromStats(stats: any): string[] {
    const ideals = []
    
    if (stats.strength > 15) ideals.push('Strength protects the weak')
    if (stats.intelligence > 15) ideals.push('Knowledge is power')
    if (stats.wisdom > 15) ideals.push('Truth above all')
    if (stats.charisma > 15) ideals.push('Unity through leadership')
    
    return ideals.slice(0, 2)
  }

  private getDominantEmotionFromClass(charClass: string): string {
    const classEmotions: Record<string, string> = {
      'fighter': 'determination',
      'wizard': 'curiosity',
      'rogue': 'excitement',
      'cleric': 'joy',
      'ranger': 'neutral',
      'bard': 'joy'
    }
    
    return classEmotions[charClass?.toLowerCase()] || 'neutral'
  }

  private generateVoiceProfile(rpgData: any): any {
    return {
      id: `voice-${rpgData.id}`,
      name: `${rpgData.name} Voice`,
      gender: this.inferGender(rpgData.name, rpgData.race),
      age: this.inferAge(rpgData.level),
      pace: 'normal',
      pitch: 'normal'
    }
  }

  private determineNarrativeRole(rpgData: any): import('@/types').NarrativeRole {
    const level = rpgData.level || 1
    const charisma = rpgData.stats?.charisma || rpgData.attributes?.charisma || 10
    
    if (level >= 10) return 'mentor'
    if (charisma > 15 || level >= 5) return 'protagonist'
    return 'supporting'
  }

  private generateDialogueStyle(rpgData: any): string {
    const stats = rpgData.stats || rpgData.attributes || {}
    const styles = []
    
    if (stats.intelligence > 15) styles.push('eloquent')
    if (stats.wisdom > 15) styles.push('thoughtful')
    if (stats.charisma > 15) styles.push('persuasive')
    if (stats.strength > 15) styles.push('direct')
    
    // Race-based modifiers
    if (rpgData.race?.toLowerCase() === 'elf') styles.push('poetic')
    if (rpgData.race?.toLowerCase() === 'dwarf') styles.push('gruff')
    
    return styles.join(', ') || 'conversational'
  }

  private inferGender(name: string, race: string): 'male' | 'female' | 'neutral' {
    // Simple heuristic - in production, this would be more sophisticated
    const femaleEndings = ['a', 'ia', 'ina', 'ara', 'ella']
    const maleEndings = ['us', 'or', 'in', 'on', 'ar']
    
    const nameLower = name.toLowerCase()
    
    for (const ending of femaleEndings) {
      if (nameLower.endsWith(ending)) return 'female'
    }
    
    for (const ending of maleEndings) {
      if (nameLower.endsWith(ending)) return 'male'
    }
    
    return 'neutral'
  }

  private inferAge(level: number): 'child' | 'teen' | 'adult' | 'elderly' {
    if (level < 3) return 'teen'
    if (level < 8) return 'adult'
    if (level < 15) return 'adult'
    return 'elderly'
  }

  private processWorldLocations(locations: any[]): any[] {
    return locations.map(loc => ({
      id: loc.id || `loc-${Date.now()}`,
      name: loc.name || 'Unnamed Location',
      description: loc.description || '',
      type: loc.type || 'location',
      connections: loc.connections || [],
      mood: loc.mood || 'neutral',
      pointsOfInterest: loc.pointsOfInterest || []
    }))
  }

  private processWorldNPCs(npcs: any[]): any[] {
    return npcs.map(npc => ({
      id: npc.id || `npc-${Date.now()}`,
      name: npc.name || 'Unnamed NPC',
      role: npc.role || 'Citizen',
      personality: npc.personality || 'Friendly',
      location: npc.location || 'Unknown',
      relationships: npc.relationships || []
    }))
  }

  private processWorldLore(lore: any): any {
    return {
      history: lore.history || [],
      cultures: lore.cultures || [],
      religions: lore.religions || [],
      languages: lore.languages || [],
      customs: lore.customs || []
    }
  }

  private processWorldTimeline(timeline: any[]): any[] {
    return timeline.map(event => ({
      id: event.id || `event-${Date.now()}`,
      name: event.name || 'Historical Event',
      description: event.description || '',
      date: event.date || 'Unknown',
      importance: event.importance || 5
    }))
  }

  private convertSessionToNarrative(session: any): string {
    // Convert RPG session log to narrative prose
    const events = session.events || []
    const narrative = events.map((event: any) => {
      if (typeof event === 'string') return event
      return event.description || event.text || ''
    }).join(' ')
    
    return narrative || `A chapter from the adventure, session ${session.sessionNumber || 'unknown'}.`
  }

  private async extractCharactersFromSessions(sessions: any[], userId: string): Promise<any[]> {
    const characterIds = new Set<string>()
    
    sessions.forEach(session => {
      if (session.characters) {
        session.characters.forEach((charId: string) => characterIds.add(charId))
      }
    })
    
    const characters = []
    for (const charId of characterIds) {
      try {
        const character = await this.importRPGCharacter(charId, userId)
        characters.push(character)
      } catch (error) {
        console.warn(`Could not import character ${charId}:`, error)
      }
    }
    
    return characters
  }

  private generateTimelineFromSessions(sessions: any[]): any[] {
    return sessions.map((session, index) => ({
      id: session.id,
      name: session.title || `Session ${index + 1}`,
      description: session.summary || `Game session ${session.sessionNumber || index + 1}`,
      date: session.date || new Date(),
      importance: 7
    }))
  }

  private extractSignificantRolls(sessions: any[]): any[] {
    // Extract important dice rolls from sessions
    return sessions.flatMap(session => 
      (session.diceRolls || []).filter((roll: any) => 
        roll.result === 20 || roll.result === 1 || roll.importance > 7
      )
    )
  }

  private extractCombats(sessions: any[]): any[] {
    return sessions.flatMap(session => session.combats || [])
  }

  private extractDecisions(sessions: any[]): any[] {
    return sessions.flatMap(session => session.decisions || [])
  }
}

// Export singleton instance
export const crossModuleBridge = CrossModuleBridge.getInstance()

// Types for cross-module integration
// Interface definitions moved to top of file to avoid duplicates