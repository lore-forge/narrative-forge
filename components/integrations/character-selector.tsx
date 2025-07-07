'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Search, 
  X, 
  Plus, 
  Shield, 
  Sword, 
  Sparkles, 
  Heart,
  Star,
  Import
} from 'lucide-react'
import type { StoryCharacter } from '@/types'

interface CharacterSelectorProps {
  onCharacterSelect: (character: StoryCharacter) => void
  selectedCharacters: StoryCharacter[]
  onRemoveCharacter: (characterId: string) => void
}

interface RPGCharacter {
  id: string
  name: string
  class: string
  race: string
  level: number
  description: string
  stats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  imageUrl?: string
  campaign?: string
}

export function CharacterSelector({ 
  onCharacterSelect, 
  selectedCharacters,
  onRemoveCharacter 
}: CharacterSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rpgCharacters, setRpgCharacters] = useState<RPGCharacter[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'rpg' | 'selected'>('rpg')

  useEffect(() => {
    loadRPGCharacters()
  }, [])

  const loadRPGCharacters = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCharacters: RPGCharacter[] = [
        {
          id: 'char-1',
          name: 'Elara Moonwhisper',
          class: 'Wizard',
          race: 'Elf',
          level: 5,
          description: 'A scholarly elf wizard with a passion for ancient magic and mysteries.',
          stats: { strength: 8, dexterity: 14, constitution: 12, intelligence: 18, wisdom: 14, charisma: 10 },
          imageUrl: '/placeholder-character-1.jpg',
          campaign: 'The Lost Scrolls'
        },
        {
          id: 'char-2',
          name: 'Thorin Ironforge',
          class: 'Fighter',
          race: 'Dwarf',
          level: 6,
          description: 'A stalwart dwarf warrior who values honor and loyalty above all else.',
          stats: { strength: 18, dexterity: 12, constitution: 16, intelligence: 10, wisdom: 12, charisma: 8 },
          imageUrl: '/placeholder-character-2.jpg',
          campaign: 'The Dragon\'s Hoard'
        },
        {
          id: 'char-3',
          name: 'Lydia Swiftblade',
          class: 'Rogue',
          race: 'Human',
          level: 4,
          description: 'A cunning rogue with a mysterious past and quick wit.',
          stats: { strength: 10, dexterity: 18, constitution: 14, intelligence: 14, wisdom: 12, charisma: 16 },
          imageUrl: '/placeholder-character-3.jpg',
          campaign: 'Shadows of the City'
        }
      ]
      
      setRpgCharacters(mockCharacters)
    } catch (error) {
      console.error('Failed to load RPG characters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const importCharacter = (rpgChar: RPGCharacter) => {
    const storyCharacter: StoryCharacter = {
      id: `story-${rpgChar.id}`,
      sourceCharacterId: rpgChar.id,
      sourceModule: 'rpg-immersive',
      name: rpgChar.name,
      description: rpgChar.description,
      background: `A level ${rpgChar.level} ${rpgChar.race} ${rpgChar.class} from the campaign "${rpgChar.campaign}"`,
      appearance: `${rpgChar.race} with distinctive ${rpgChar.class} features`,
      personality: {
        traits: generatePersonalityTraits(rpgChar),
        motivations: generateMotivations(rpgChar),
        fears: generateFears(rpgChar),
        ideals: generateIdeals(rpgChar),
        confidence: rpgChar.stats.charisma / 20,
        intelligence: rpgChar.stats.intelligence / 20,
        physicality: rpgChar.stats.strength / 20
      },
      narrativeRole: determineNarrativeRole(rpgChar),
      dialogueStyle: generateDialogueStyle(rpgChar),
      relationships: [],
      lastSync: new Date(),
      syncEnabled: true
    }

    onCharacterSelect(storyCharacter)
  }

  const filteredCharacters = rpgCharacters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.race.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getClassIcon = (charClass: string) => {
    switch (charClass.toLowerCase()) {
      case 'fighter':
      case 'warrior':
        return <Sword className="w-4 h-4" />
      case 'wizard':
      case 'mage':
        return <Sparkles className="w-4 h-4" />
      case 'rogue':
      case 'thief':
        return <Star className="w-4 h-4" />
      case 'cleric':
      case 'priest':
        return <Heart className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rpg' | 'selected')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rpg" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Import from RPG ({rpgCharacters.length})
          </TabsTrigger>
          <TabsTrigger value="selected" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Selected ({selectedCharacters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rpg" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search characters by name, class, or race..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCharacters.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No characters found</p>
                <p className="text-sm mt-2">Try adjusting your search or create characters in RPG Immersive</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCharacters.map((character) => {
                  const isSelected = selectedCharacters.some(c => c.sourceCharacterId === character.id)
                  
                  return (
                    <Card 
                      key={character.id}
                      className={`transition-all ${
                        isSelected ? 'border-narrative-500 bg-narrative-50 dark:bg-narrative-900/20' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={character.imageUrl} alt={character.name} />
                            <AvatarFallback>
                              {character.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{character.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    {getClassIcon(character.class)}
                                    {character.class}
                                  </Badge>
                                  <Badge variant="outline">{character.race}</Badge>
                                  <Badge variant="outline">Lvl {character.level}</Badge>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant={isSelected ? "secondary" : "default"}
                                onClick={() => isSelected ? onRemoveCharacter(character.id) : importCharacter(character)}
                                disabled={isSelected}
                              >
                                {isSelected ? (
                                  <>
                                    <X className="w-4 h-4 mr-1" />
                                    Selected
                                  </>
                                ) : (
                                  <>
                                    <Import className="w-4 h-4 mr-1" />
                                    Import
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {character.description}
                            </p>
                            
                            {character.campaign && (
                              <p className="text-xs text-gray-500 mt-2">
                                Campaign: {character.campaign}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            {selectedCharacters.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No characters selected</p>
                <p className="text-sm mt-2">Import characters from the RPG tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCharacters.map((character) => (
                  <Card key={character.id} className="border-narrative-200 dark:border-narrative-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{character.name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {character.narrativeRole}
                          </Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {character.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Imported from: {character.sourceModule}
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveCharacter(character.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions to generate story character attributes from RPG stats
function generatePersonalityTraits(char: RPGCharacter): string[] {
  const traits = []
  
  if (char.stats.strength > 15) traits.push('Strong', 'Protective')
  if (char.stats.intelligence > 15) traits.push('Intelligent', 'Analytical')
  if (char.stats.wisdom > 15) traits.push('Wise', 'Perceptive')
  if (char.stats.charisma > 15) traits.push('Charismatic', 'Persuasive')
  
  // Class-based traits
  switch (char.class.toLowerCase()) {
    case 'fighter':
      traits.push('Brave', 'Disciplined')
      break
    case 'wizard':
      traits.push('Studious', 'Curious')
      break
    case 'rogue':
      traits.push('Cunning', 'Resourceful')
      break
    case 'cleric':
      traits.push('Devout', 'Compassionate')
      break
  }
  
  return traits.slice(0, 4)
}

function generateMotivations(char: RPGCharacter): string[] {
  const motivations = []
  
  // Class-based motivations
  switch (char.class.toLowerCase()) {
    case 'fighter':
      motivations.push('Protect the innocent', 'Prove their strength')
      break
    case 'wizard':
      motivations.push('Uncover ancient knowledge', 'Master their craft')
      break
    case 'rogue':
      motivations.push('Seek fortune', 'Right past wrongs')
      break
    case 'cleric':
      motivations.push('Serve their deity', 'Heal the suffering')
      break
    default:
      motivations.push('Find their destiny', 'Make a difference')
  }
  
  return motivations
}

function generateFears(char: RPGCharacter): string[] {
  const fears = []
  
  if (char.stats.wisdom < 10) fears.push('Being deceived')
  if (char.stats.constitution < 10) fears.push('Physical weakness')
  
  // Universal fears
  fears.push('Failing their companions', 'Losing their identity')
  
  return fears.slice(0, 2)
}

function generateIdeals(char: RPGCharacter): string[] {
  const ideals = []
  
  // Stat-based ideals
  if (char.stats.strength > 15) ideals.push('Strength protects the weak')
  if (char.stats.intelligence > 15) ideals.push('Knowledge is power')
  if (char.stats.wisdom > 15) ideals.push('Truth above all')
  if (char.stats.charisma > 15) ideals.push('Unity through leadership')
  
  return ideals.slice(0, 2)
}

function determineNarrativeRole(char: RPGCharacter): 'protagonist' | 'supporting' | 'mentor' {
  if (char.level >= 10) return 'mentor'
  if (char.stats.charisma > 15 || char.level >= 5) return 'protagonist'
  return 'supporting'
}

function generateDialogueStyle(char: RPGCharacter): string {
  const styles = []
  
  if (char.stats.intelligence > 15) styles.push('eloquent')
  if (char.stats.wisdom > 15) styles.push('thoughtful')
  if (char.stats.charisma > 15) styles.push('persuasive')
  if (char.stats.strength > 15) styles.push('direct')
  
  // Race-based modifiers
  if (char.race.toLowerCase() === 'elf') styles.push('poetic')
  if (char.race.toLowerCase() === 'dwarf') styles.push('gruff')
  
  return styles.join(', ') || 'conversational'
}