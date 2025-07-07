'use client'

import { useState } from 'react'
import { StoryCreationWizard } from '@/components/story/story-creation-wizard'
import { Navigation } from '@/components/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Sparkles, Users, Zap } from 'lucide-react'

export default function CreateStoryPage() {
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-narrative-50 to-story-50 dark:from-narrative-950 dark:to-story-950">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <StoryCreationWizard onComplete={() => setShowWizard(false)} />
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-narrative-50 to-story-50 dark:from-narrative-950 dark:to-story-950">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-narrative-100 text-narrative-700 hover:bg-narrative-200 dark:bg-narrative-800 dark:text-narrative-300">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Story Creation
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-narrative-600 via-story-600 to-chapter-600 bg-clip-text text-transparent">
                  Create Your Story
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Transform your imagination into captivating stories with AI assistance. 
                Import characters from your RPG adventures, set tales in crafted worlds, 
                and learn creative writing through intelligent guidance.
              </p>
            </div>

            {/* Story Creation Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Quick Story */}
              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-narrative-300 dark:hover:border-narrative-600">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-narrative-100 dark:bg-narrative-800 group-hover:bg-narrative-200 dark:group-hover:bg-narrative-700 transition-colors">
                      <Zap className="w-6 h-6 text-narrative-600 dark:text-narrative-400" />
                    </div>
                    <Badge variant="secondary">Quick Start</Badge>
                  </div>
                  <CardTitle className="text-xl">Quick Story</CardTitle>
                  <CardDescription>
                    Create a short story from a simple prompt. Perfect for beginners 
                    or when you want to explore a quick idea.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-narrative-400 rounded-full" />
                      <span>1-3 chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-narrative-400 rounded-full" />
                      <span>15-30 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-narrative-400 rounded-full" />
                      <span>AI-guided creation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Story */}
              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-story-300 dark:hover:border-story-600">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-story-100 dark:bg-story-800 group-hover:bg-story-200 dark:group-hover:bg-story-700 transition-colors">
                      <BookOpen className="w-6 h-6 text-story-600 dark:text-story-400" />
                    </div>
                    <Badge variant="secondary">Advanced</Badge>
                  </div>
                  <CardTitle className="text-xl">Detailed Story</CardTitle>
                  <CardDescription>
                    Create a comprehensive story with detailed planning, 
                    character development, and rich world-building.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-story-400 rounded-full" />
                      <span>5-15 chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-story-400 rounded-full" />
                      <span>45-90 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-story-400 rounded-full" />
                      <span>Character & world integration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-narrative-200 dark:border-narrative-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-narrative-500" />
                    <div>
                      <h3 className="font-semibold text-sm">RPG Characters</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Import from RPG Immersive
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-story-200 dark:border-story-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-story-500" />
                    <div>
                      <h3 className="font-semibold text-sm">Crafted Worlds</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Import from World Builder
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-chapter-200 dark:border-chapter-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-chapter-500" />
                    <div>
                      <h3 className="font-semibold text-sm">AI Assistance</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Educational guidance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-narrative-500 to-story-500 hover:from-narrative-600 hover:to-story-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Start Story Creation Wizard
              </button>
              
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                The wizard will guide you through the entire process step-by-step
              </p>
            </div>

            {/* Educational Notice */}
            <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-narrative-100/50 to-story-100/50 dark:from-narrative-900/50 dark:to-story-900/50 backdrop-blur-sm border border-narrative-200/50 dark:border-narrative-700/50">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 text-center">
                🎓 Designed for Young Creators (Ages 8-14)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Learning Features:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-narrative-400 rounded-full" />
                      Writing skill assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-narrative-400 rounded-full" />
                      Adaptive complexity
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-narrative-400 rounded-full" />
                      Progress tracking
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Safety Features:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-story-400 rounded-full" />
                      Age-appropriate content
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-story-400 rounded-full" />
                      COPPA compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-story-400 rounded-full" />
                      Positive themes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}