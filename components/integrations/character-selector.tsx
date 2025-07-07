'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, X } from 'lucide-react'
import type { StoryCharacter } from '@/types'

interface CharacterSelectorProps {
  onCharacterSelect: (character: StoryCharacter) => void
  selectedCharacters: StoryCharacter[]
  onRemoveCharacter: (characterId: string) => void
}

export function CharacterSelector({
  onCharacterSelect,
  selectedCharacters,
  onRemoveCharacter
}: CharacterSelectorProps) {
  const [_isLoading, _setIsLoading] = useState(false)

  // Mock characters for demo
  const availableCharacters: StoryCharacter[] = [
    {
      id: '1',
      name: 'Aria Moonwhisper',
      description: 'A skilled elven ranger with a mysterious past',
      background: 'Raised in the Silverwood Forest',
      appearance: 'Tall and graceful with silver hair and green eyes',
      personality: {
        traits: ['Curious', 'Brave', 'Loyal'],
        motivations: ['Protect nature', 'Uncover family secrets'],
        fears: ['Losing loved ones', 'Dark magic'],
        ideals: ['Honor', 'Justice'],
        confidence: 7,
        intelligence: 8,
        physicality: 6
      },
      voiceProfile: {
        id: 'voice-1',
        name: 'Aria Voice',
        gender: 'female',
        age: 'adult',
        pace: 'normal',
        pitch: 'normal'
      },
      narrativeRole: 'protagonist',
      dialogueStyle: 'Thoughtful and poetic',
      relationships: [],
      syncEnabled: true
    }
  ]

  const handleSelectCharacter = (character: StoryCharacter) => {
    if (!selectedCharacters.find(c => c.id === character.id)) {
      onCharacterSelect(character)
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected Characters */}
      {selectedCharacters.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Selected Characters</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCharacters.map(character => (
              <Badge
                key={character.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {character.name}
                <button
                  onClick={() => onRemoveCharacter(character.id)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Characters */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Available Characters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableCharacters.map(character => {
            const isSelected = selectedCharacters.find(c => c.id === character.id)
            
            return (
              <Card
                key={character.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-md hover:scale-[1.02]'
                }`}
                onClick={() => !isSelected && handleSelectCharacter(character)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{character.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {character.narrativeRole}
                      </CardDescription>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {character.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {character.personality.traits.slice(0, 3).map(trait => (
                      <Badge key={trait} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Import from RPG Button */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium">Import from RPG Immersive</p>
              <p className="text-xs text-gray-500">
                Connect your RPG characters to this story
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}