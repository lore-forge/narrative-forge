'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Globe, 
  Search, 
  Mountain, 
  Castle, 
  Forest, 
  Waves,
  Map,
  Users,
  Book,
  Check,
  X
} from 'lucide-react'
import type { WorldContext } from '@/types'

interface WorldSelectorProps {
  onWorldSelect: (world: WorldContext | null) => void
  selectedWorld: WorldContext | null
}

interface WorldBuilderWorld {
  id: string
  name: string
  genre: string
  description: string
  status: 'active' | 'draft' | 'archived'
  locationCount: number
  npcCount: number
  lorePages: number
  imageUrl?: string
  tags: string[]
  createdAt: Date
  lastModified: Date
}

export function WorldSelector({ onWorldSelect, selectedWorld }: WorldSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [worlds, setWorlds] = useState<WorldBuilderWorld[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadWorlds()
  }, [])

  const loadWorlds = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual World Builder integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockWorlds: WorldBuilderWorld[] = [
        {
          id: 'world-1',
          name: 'Aethermoor',
          genre: 'fantasy',
          description: 'A mystical realm where floating islands drift through endless skies, connected by bridges of crystallized wind and inhabited by sky-dwelling peoples.',
          status: 'active',
          locationCount: 12,
          npcCount: 25,
          lorePages: 8,
          imageUrl: '/placeholder-world-1.jpg',
          tags: ['floating islands', 'sky cities', 'crystal magic', 'aerial travel'],
          createdAt: new Date('2024-01-15'),
          lastModified: new Date('2024-01-20')
        },
        {
          id: 'world-2',
          name: 'The Mechanium Empire',
          genre: 'science-fiction',
          description: 'A sprawling technological empire where steam and clockwork blend with advanced automatons in a world of brass towers and mechanical wonders.',
          status: 'active',
          locationCount: 18,
          npcCount: 42,
          lorePages: 15,
          imageUrl: '/placeholder-world-2.jpg',
          tags: ['steampunk', 'automatons', 'clockwork', 'brass cities'],
          createdAt: new Date('2024-01-10'),
          lastModified: new Date('2024-01-22')
        },
        {
          id: 'world-3',
          name: 'Whisperwood',
          genre: 'mystery',
          description: 'An ancient forest where the trees themselves hold memories and secrets whisper through the leaves, hiding an ancient conspiracy.',
          status: 'draft',
          locationCount: 8,
          npcCount: 15,
          lorePages: 5,
          imageUrl: '/placeholder-world-3.jpg',
          tags: ['ancient forest', 'sentient trees', 'mysteries', 'whispers'],
          createdAt: new Date('2024-01-05'),
          lastModified: new Date('2024-01-18')
        },
        {
          id: 'world-4',
          name: 'Pirate Archipelago',
          genre: 'adventure',
          description: 'A chain of tropical islands ruled by pirate captains, where treasure maps lead to both gold and danger.',
          status: 'active',
          locationCount: 22,
          npcCount: 38,
          lorePages: 12,
          imageUrl: '/placeholder-world-4.jpg',
          tags: ['pirates', 'islands', 'treasure', 'sailing'],
          createdAt: new Date('2024-01-01'),
          lastModified: new Date('2024-01-25')
        }
      ]
      
      setWorlds(mockWorlds)
    } catch (error) {
      console.error('Failed to load worlds:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const convertToWorldContext = (world: WorldBuilderWorld): WorldContext => {
    return {
      id: world.id,
      name: world.name,
      description: world.description,
      genre: world.genre as any,
      locations: generateMockLocations(world),
      npcs: generateMockNPCs(world),
      lore: generateMockLore(world),
      timeline: generateMockTimeline(world),
      maps: [],
      images: []
    }
  }

  const filteredWorlds = worlds.filter(world =>
    world.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    world.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    world.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    world.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getGenreIcon = (genre: string) => {
    switch (genre.toLowerCase()) {
      case 'fantasy':
        return <Castle className="w-4 h-4" />
      case 'science-fiction':
        return <Mountain className="w-4 h-4" />
      case 'mystery':
        return <Forest className="w-4 h-4" />
      case 'adventure':
        return <Waves className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search worlds by name, genre, or tags..."
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-18" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWorlds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No worlds found</p>
            <p className="text-sm mt-2">Try adjusting your search or create worlds in World Builder</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorlds.map((world) => {
              const isSelected = selectedWorld?.id === world.id
              
              return (
                <Card 
                  key={world.id}
                  className={`transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-story-500 bg-story-50 dark:bg-story-900/20 ring-2 ring-story-200 dark:ring-story-800' 
                      : 'hover:border-story-300 dark:hover:border-story-600'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      onWorldSelect(null)
                    } else {
                      onWorldSelect(convertToWorldContext(world))
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{world.name}</h3>
                            <Badge 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              {getGenreIcon(world.genre)}
                              {world.genre}
                            </Badge>
                            <Badge 
                              className={getStatusColor(world.status)}
                              variant="outline"
                            >
                              {world.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {world.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {world.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {world.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{world.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Map className="w-3 h-3" />
                              <span>{world.locationCount} locations</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{world.npcCount} NPCs</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Book className="w-3 h-3" />
                              <span>{world.lorePages} lore pages</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className={isSelected ? "bg-story-500 hover:bg-story-600" : ""}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Selected
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4 mr-1" />
                                Select
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 border-t pt-2">
                        Last modified: {world.lastModified.toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {selectedWorld && (
        <Card className="border-story-500 bg-story-50 dark:bg-story-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-story-600" />
              Selected World: {selectedWorld.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                {selectedWorld.description}
              </p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{selectedWorld.locations.length} locations available</span>
                <span>{selectedWorld.npcs.length} NPCs available</span>
                <span>Rich lore and timeline</span>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onWorldSelect(null)}
              className="mt-3 text-story-600 hover:text-story-700"
            >
              <X className="w-4 h-4 mr-1" />
              Deselect World
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper functions to generate mock world data
function generateMockLocations(world: WorldBuilderWorld) {
  const locationTypes = {
    fantasy: ['Ancient Temple', 'Enchanted Forest', 'Dragon\'s Lair', 'Magic Academy'],
    'science-fiction': ['Space Station', 'Cybercity District', 'Research Lab', 'Mech Factory'],
    mystery: ['Hidden Grove', 'Abandoned Manor', 'Secret Cave', 'Forgotten Library'],
    adventure: ['Treasure Island', 'Pirate Cove', 'Sea Monster Lair', 'Hidden Harbor']
  }

  const types = locationTypes[world.genre as keyof typeof locationTypes] || ['Generic Location']
  
  return Array.from({ length: Math.min(world.locationCount, 5) }, (_, i) => ({
    id: `${world.id}-loc-${i}`,
    name: `${types[i % types.length]} ${i + 1}`,
    description: `A significant location in ${world.name}`,
    type: types[i % types.length].toLowerCase().replace(' ', '-'),
    connections: [],
    mood: ['mysterious', 'welcoming', 'dangerous', 'magical'][i % 4],
    pointsOfInterest: [`Point of interest ${i + 1}`, `Notable feature ${i + 1}`]
  }))
}

function generateMockNPCs(world: WorldBuilderWorld) {
  const npcTypes = {
    fantasy: ['Wise Sage', 'Royal Guard', 'Tavern Keeper', 'Court Wizard'],
    'science-fiction': ['AI Construct', 'Space Captain', 'Tech Engineer', 'Colony Leader'],
    mystery: ['Mysterious Stranger', 'Local Guide', 'Secret Keeper', 'Wise Elder'],
    adventure: ['Pirate Captain', 'Island Chief', 'Treasure Hunter', 'Sea Merchant']
  }

  const types = npcTypes[world.genre as keyof typeof npcTypes] || ['Generic NPC']
  
  return Array.from({ length: Math.min(world.npcCount, 5) }, (_, i) => ({
    id: `${world.id}-npc-${i}`,
    name: `${types[i % types.length]} ${i + 1}`,
    role: types[i % types.length],
    personality: 'Friendly and helpful',
    location: `Location ${i + 1}`,
    relationships: []
  }))
}

function generateMockLore(world: WorldBuilderWorld) {
  return {
    history: [
      { id: '1', event: `The founding of ${world.name}`, description: 'Ancient origins', date: '1000 years ago', importance: 9 },
      { id: '2', event: 'The Great Change', description: 'A pivotal moment', date: '500 years ago', importance: 8 }
    ],
    cultures: [
      { id: '1', name: 'Primary Culture', description: `The main culture of ${world.name}`, traditions: [], language: 'Common' }
    ],
    religions: [
      { id: '1', name: 'Primary Faith', description: 'The dominant belief system', deities: [], practices: [] }
    ],
    languages: [
      { id: '1', name: 'Common', description: 'The standard language', speakers: 'Most inhabitants' }
    ],
    customs: [
      { id: '1', name: 'Welcome Ritual', description: 'How strangers are greeted', significance: 'Social cohesion' }
    ]
  }
}

function generateMockTimeline(world: WorldBuilderWorld) {
  return [
    {
      id: '1',
      name: 'Foundation Era',
      description: `The early days of ${world.name}`,
      date: '1000 years ago',
      importance: 10
    },
    {
      id: '2',
      name: 'Current Era',
      description: 'The present time period',
      date: 'Present',
      importance: 8
    }
  ]
}