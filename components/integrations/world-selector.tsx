'use client'

// import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Plus } from 'lucide-react'
import type { WorldContext } from '@/types'

interface WorldSelectorProps {
  onWorldSelect: (world: WorldContext | null) => void
  selectedWorld: WorldContext | null
}

export function WorldSelector({
  onWorldSelect,
  selectedWorld
}: WorldSelectorProps) {
  // Mock worlds for demo
  const availableWorlds: WorldContext[] = [
    {
      id: '1',
      name: 'Eldoria',
      description: 'A mystical realm of ancient forests and forgotten magic',
      genre: 'fantasy',
      locations: [],
      npcs: [],
      lore: {
        history: [],
        cultures: [],
        religions: [],
        languages: [],
        customs: []
      },
      timeline: []
    }
  ]

  return (
    <div className="space-y-4">
      {/* Selected World */}
      {selectedWorld && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Selected World</h4>
          <Card className="border-story-200 dark:border-story-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-semibold">{selectedWorld.name}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedWorld.description}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {selectedWorld.genre}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onWorldSelect(null)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Worlds */}
      {!selectedWorld && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Available Worlds</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableWorlds.map(world => (
              <Card
                key={world.id}
                className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                onClick={() => onWorldSelect(world)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{world.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {world.genre}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {world.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Import from World Builder Button */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium">Import from World Builder</p>
              <p className="text-xs text-gray-500">
                Connect your crafted worlds to this story
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