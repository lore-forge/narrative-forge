'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { CharacterSelector } from '@/components/integrations/character-selector'
import { WorldSelector } from '@/components/integrations/world-selector'
import { AIAssistant } from '@/components/ai/ai-assistant'
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Users, 
  Globe, 
  Wand2,
  Loader2,
  CheckCircle
} from 'lucide-react'
import type { 
  StoryGenerationRequest, 
  Genre, 
  AudienceLevel, 
  StoryLength,
  StoryCharacter,
  WorldContext 
} from '@/types'

interface StoryCreationWizardProps {
  onComplete: () => void
}

type WizardStep = 'prompt' | 'details' | 'integration' | 'review' | 'generating' | 'complete'

export function StoryCreationWizard({ onComplete }: StoryCreationWizardProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('prompt')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form data
  const [storyData, setStoryData] = useState<Partial<StoryGenerationRequest>>({
    initialPrompt: '',
    genre: 'fantasy',
    targetAudience: 'child',
    length: 'short',
    includeImages: true,
    includeInteractive: true,
    includeAudio: false
  })
  
  const [selectedCharacters, setSelectedCharacters] = useState<StoryCharacter[]>([])
  const [selectedWorld, setSelectedWorld] = useState<WorldContext | null>(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState('')

  const steps = [
    { id: 'prompt', title: 'Story Idea', icon: BookOpen },
    { id: 'details', title: 'Story Details', icon: Sparkles },
    { id: 'integration', title: 'Characters & World', icon: Users },
    { id: 'review', title: 'Review & Generate', icon: Wand2 }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleNext = () => {
    const stepOrder: WizardStep[] = ['prompt', 'details', 'integration', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    const stepOrder: WizardStep[] = ['prompt', 'details', 'integration', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleGenerateStory = async () => {
    setIsGenerating(true)
    setCurrentStep('generating')

    try {
      const request: StoryGenerationRequest = {
        ...storyData as StoryGenerationRequest,
        characters: selectedCharacters.length > 0 ? selectedCharacters : undefined,
        worldContext: selectedWorld || undefined
      }

      const response = await fetch('/api/story-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Story generation failed')
      }

      const result = await response.json()
      
      // Save story to database
      const storyId = await saveStoryToDatabase(result.story)
      
      setCurrentStep('complete')
      
      toast({
        title: "Story Created Successfully! 🎉",
        description: `"${result.story.title}" has been generated and saved.`,
        duration: 5000
      })

      // Redirect to story editor after a short delay
      setTimeout(() => {
        router.push(`/stories/${storyId}/edit`)
      }, 2000)

    } catch (error) {
      console.error('Story generation error:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
      setCurrentStep('review')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'prompt':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold mb-4">What's your story idea?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Describe your story in a few sentences. Don't worry about being perfect - 
                our AI will help enhance and develop your idea!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">Story Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="A young wizard discovers a hidden library that contains books that can bring stories to life..."
                  className="min-h-[150px] mt-2"
                  value={storyData.initialPrompt}
                  onChange={(e) => setStoryData({ ...storyData, initialPrompt: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tip: Include the main character, setting, and central conflict for best results.
                </p>
              </div>

              <AIAssistant
                context="prompt"
                onSuggestion={(suggestion) => {
                  setStoryData({ ...storyData, initialPrompt: suggestion })
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['A magical adventure', 'A mystery to solve', 'A journey of friendship', 'A hero\'s quest'].map((example) => (
                <button
                  key={example}
                  onClick={() => setStoryData({ ...storyData, initialPrompt: example })}
                  className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">Example:</span>
                  <p className="text-sm font-medium mt-1">{example}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 'details':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold mb-4">Story Details</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose the genre, audience, and length for your story.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={storyData.genre}
                  onValueChange={(value: Genre) => setStoryData({ ...storyData, genre: value })}
                >
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="science-fiction">Science Fiction</SelectItem>
                    <SelectItem value="mystery">Mystery</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select
                  value={storyData.targetAudience}
                  onValueChange={(value: AudienceLevel) => setStoryData({ ...storyData, targetAudience: value })}
                >
                  <SelectTrigger id="audience">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Children (8-10)</SelectItem>
                    <SelectItem value="preteen">Preteens (11-12)</SelectItem>
                    <SelectItem value="teen">Teens (13-14)</SelectItem>
                    <SelectItem value="young-adult">Young Adults (15-18)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Story Length</Label>
                <Select
                  value={storyData.length}
                  onValueChange={(value: StoryLength) => setStoryData({ ...storyData, length: value })}
                >
                  <SelectTrigger id="length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-3 chapters)</SelectItem>
                    <SelectItem value="medium">Medium (4-8 chapters)</SelectItem>
                    <SelectItem value="long">Long (9-15 chapters)</SelectItem>
                    <SelectItem value="novel">Novel (16+ chapters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Story Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Leave blank for AI suggestion"
                  value={storyData.title || ''}
                  onChange={(e) => setStoryData({ ...storyData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Additional Features</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storyData.includeImages}
                    onChange={(e) => setStoryData({ ...storyData, includeImages: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Include AI-generated images</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storyData.includeInteractive}
                    onChange={(e) => setStoryData({ ...storyData, includeInteractive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Add interactive elements (choices, questions)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storyData.includeAudio}
                    onChange={(e) => setStoryData({ ...storyData, includeAudio: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Generate audio narration</span>
                </label>
              </div>
            </div>
          </motion.div>
        )

      case 'integration':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold mb-4">Characters & World</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Import characters from your RPG adventures or set your story in an existing world.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-narrative-500" />
                  <h3 className="text-lg font-semibold">Characters</h3>
                  <Badge variant="secondary">{selectedCharacters.length} selected</Badge>
                </div>
                <CharacterSelector
                  onCharacterSelect={(character) => {
                    setSelectedCharacters([...selectedCharacters, character])
                  }}
                  selectedCharacters={selectedCharacters}
                  onRemoveCharacter={(characterId) => {
                    setSelectedCharacters(selectedCharacters.filter(c => c.id !== characterId))
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-story-500" />
                  <h3 className="text-lg font-semibold">World Setting</h3>
                  {selectedWorld && <Badge variant="secondary">1 selected</Badge>}
                </div>
                <WorldSelector
                  onWorldSelect={setSelectedWorld}
                  selectedWorld={selectedWorld}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-narrative-50 dark:bg-narrative-900/20 border border-narrative-200 dark:border-narrative-800">
              <p className="text-sm text-narrative-700 dark:text-narrative-300">
                <strong>Tip:</strong> Importing characters and worlds helps create consistent, 
                rich narratives that connect with your other Lore Forge creations.
              </p>
            </div>
          </motion.div>
        )

      case 'review':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold mb-4">Review Your Story</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Review your story details before generating. You can go back to make changes.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Story Concept</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{storyData.initialPrompt}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Story Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Genre:</span>
                    <Badge variant="secondary">{storyData.genre}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Audience:</span>
                    <Badge variant="secondary">{storyData.targetAudience}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Length:</span>
                    <Badge variant="secondary">{storyData.length}</Badge>
                  </div>
                  {storyData.title && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Title:</span>
                      <span className="font-medium">{storyData.title}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {(selectedCharacters.length > 0 || selectedWorld) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Integrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedCharacters.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Characters:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCharacters.map(char => (
                            <Badge key={char.id} variant="outline">
                              {char.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedWorld && (
                      <div>
                        <p className="text-sm font-medium mb-1">World:</p>
                        <Badge variant="outline">{selectedWorld.name}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {storyData.includeImages && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">AI-generated images</span>
                      </div>
                    )}
                    {storyData.includeInteractive && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Interactive elements</span>
                      </div>
                    )}
                    {storyData.includeAudio && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Audio narration</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Story generation typically takes 30-60 seconds. 
                Longer stories or those with images may take a bit more time.
              </p>
            </div>
          </motion.div>
        )

      case 'generating':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-narrative-400 to-story-400 animate-pulse" />
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white animate-ai-thinking" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Generating Your Story</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              Our AI is crafting your narrative, developing characters, and building your world...
            </p>
            
            <div className="w-full max-w-xs">
              <Progress value={33} className="mb-2" />
              <p className="text-sm text-center text-gray-500">Creating narrative structure...</p>
            </div>

            <div className="mt-8 space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing story elements</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Developing character arcs</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building chapter structure</span>
              </div>
            </div>
          </motion.div>
        )

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="mb-8">
              <CheckCircle className="w-24 h-24 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Story Created!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              Your story has been generated successfully. Redirecting to the editor...
            </p>
            
            <Loader2 className="w-6 h-6 animate-spin text-narrative-500" />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create Your Story</h1>
          <Button variant="ghost" size="sm" onClick={onComplete}>
            Cancel
          </Button>
        </div>
        
        {/* Progress Steps */}
        {!['generating', 'complete'].includes(currentStep) && (
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex
              
              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-colors
                        ${isActive ? 'bg-narrative-500 text-white' : 
                          isCompleted ? 'bg-narrative-200 text-narrative-600 dark:bg-narrative-800 dark:text-narrative-400' : 
                          'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'}
                      `}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`
                        font-medium text-sm hidden md:block
                        ${isActive ? 'text-narrative-600 dark:text-narrative-400' : 
                          isCompleted ? 'text-gray-700 dark:text-gray-300' : 
                          'text-gray-400 dark:text-gray-600'}
                      `}
                    >
                      {step.title}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div
                        className={`
                          h-1 rounded-full transition-colors
                          ${isCompleted ? 'bg-narrative-200 dark:bg-narrative-800' : 
                            'bg-gray-100 dark:bg-gray-800'}
                        `}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        {!['generating', 'complete'].includes(currentStep) && (
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 'prompt'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === 'review' ? (
              <Button
                onClick={handleGenerateStory}
                disabled={!storyData.initialPrompt || isGenerating}
                className="bg-gradient-to-r from-narrative-500 to-story-500 hover:from-narrative-600 hover:to-story-600 text-white"
              >
                Generate Story
                <Wand2 className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentStep === 'prompt' && !storyData.initialPrompt}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper functions
async function getAuthToken(): Promise<string> {
  // This would get the actual auth token from your auth context/provider
  return 'mock-auth-token'
}

async function saveStoryToDatabase(story: any): Promise<string> {
  // This would save the story to Firestore and return the ID
  return 'generated-story-id'
}