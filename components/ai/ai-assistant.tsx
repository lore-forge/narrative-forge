'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  RefreshCw,
  Wand2,
  MessageSquare,
  BookOpen,
  Users
} from 'lucide-react'

interface AIAssistantProps {
  context: 'prompt' | 'character' | 'world' | 'story' | 'chapter'
  onSuggestion: (suggestion: string) => void
  currentText?: string
  placeholder?: string
}

interface Suggestion {
  id: string
  text: string
  type: 'enhancement' | 'alternative' | 'expansion' | 'simplification'
  category: string
}

export function AIAssistant({ 
  context, 
  onSuggestion, 
  currentText = '',
  placeholder = "Need help? I can suggest improvements, alternatives, or expansions..." 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [customPrompt, setCustomPrompt] = useState('')

  const generateSuggestions = async () => {
    setIsGenerating(true)
    
    // Simulate AI suggestion generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockSuggestions = getSuggestionsForContext(context, currentText)
    setSuggestions(mockSuggestions)
    setIsGenerating(false)
  }

  const applySuggestion = (suggestion: Suggestion) => {
    onSuggestion(suggestion.text)
  }

  const generateCustomSuggestion = async () => {
    if (!customPrompt.trim()) return
    
    setIsGenerating(true)
    
    // Simulate custom AI generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const customSuggestion: Suggestion = {
      id: `custom-${Date.now()}`,
      text: `Enhanced based on your request: ${customPrompt}`,
      type: 'enhancement',
      category: 'Custom'
    }
    
    setSuggestions([customSuggestion, ...suggestions])
    setCustomPrompt('')
    setIsGenerating(false)
  }

  const getContextIcon = () => {
    switch (context) {
      case 'prompt':
        return <Lightbulb className="w-4 h-4" />
      case 'character':
        return <Users className="w-4 h-4" />
      case 'world':
        return <BookOpen className="w-4 h-4" />
      case 'story':
      case 'chapter':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const getContextTitle = () => {
    switch (context) {
      case 'prompt':
        return 'Story Idea Assistant'
      case 'character':
        return 'Character Development Assistant'
      case 'world':
        return 'World Building Assistant'
      case 'story':
        return 'Story Enhancement Assistant'
      case 'chapter':
        return 'Chapter Writing Assistant'
      default:
        return 'AI Writing Assistant'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'enhancement':
        return 'bg-narrative-100 text-narrative-700 dark:bg-narrative-800 dark:text-narrative-300'
      case 'alternative':
        return 'bg-story-100 text-story-700 dark:bg-story-800 dark:text-story-300'
      case 'expansion':
        return 'bg-chapter-100 text-chapter-700 dark:bg-chapter-800 dark:text-chapter-300'
      case 'simplification':
        return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Card className="border-narrative-200 dark:border-narrative-700">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-narrative-50 dark:hover:bg-narrative-900/20 transition-colors">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getContextIcon()}
                {getContextTitle()}
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
            <CardDescription>
              Get AI-powered suggestions to improve your {context}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateSuggestions}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
                Get Suggestions
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuggestions([])}
                disabled={suggestions.length === 0}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </Button>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Request:</label>
              <div className="flex gap-2">
                <Textarea
                  placeholder={placeholder}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  size="sm"
                  onClick={generateCustomSuggestion}
                  disabled={!customPrompt.trim() || isGenerating}
                  className="self-end"
                >
                  <Wand2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">AI Suggestions:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getTypeColor(suggestion.type)}
                          >
                            {suggestion.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{suggestion.category}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => applySuggestion(suggestion)}
                          className="shrink-0"
                        >
                          Use This
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context-specific tips */}
            <div className="p-3 rounded-lg bg-narrative-50 dark:bg-narrative-900/20 border border-narrative-200 dark:border-narrative-800">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-narrative-600" />
                Writing Tips for {context}:
              </h4>
              <ul className="text-xs text-narrative-700 dark:text-narrative-300 space-y-1">
                {getContextTips(context).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-narrative-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// Helper functions for generating context-specific suggestions and tips
function getSuggestionsForContext(context: string, currentText: string): Suggestion[] {
  const baseSuggestions = {
    prompt: [
      {
        id: '1',
        text: "A young apprentice discovers a hidden power that could either save or destroy their village, but using it means betraying everything they've been taught.",
        type: 'enhancement' as const,
        category: 'Plot Enhancement'
      },
      {
        id: '2', 
        text: "Two unlikely friends from different worlds must work together to solve a mystery that threatens both their homes.",
        type: 'alternative' as const,
        category: 'Character Focus'
      },
      {
        id: '3',
        text: "Add a ticking clock element - perhaps the character only has three days to complete their quest before something terrible happens.",
        type: 'expansion' as const,
        category: 'Tension Building'
      }
    ],
    character: [
      {
        id: '1',
        text: "Give your character a unique skill or talent that helps them but also creates problems - like being able to hear others' thoughts but not control when it happens.",
        type: 'enhancement' as const,
        category: 'Character Development'
      },
      {
        id: '2',
        text: "Create a meaningful backstory connection to the main conflict - perhaps their family was affected by similar events in the past.",
        type: 'expansion' as const,
        category: 'Backstory'
      },
      {
        id: '3',
        text: "Add a character flaw that creates internal conflict - being too trusting, too proud, or afraid of commitment.",
        type: 'enhancement' as const,
        category: 'Character Depth'
      }
    ],
    world: [
      {
        id: '1',
        text: "Create unique rules for your world - maybe magic only works during certain moon phases, or technology is powered by emotions.",
        type: 'enhancement' as const,
        category: 'World Rules'
      },
      {
        id: '2',
        text: "Add social or political tensions between different groups in your world to create natural conflict opportunities.",
        type: 'expansion' as const,
        category: 'Social Dynamics'
      },
      {
        id: '3',
        text: "Include environmental storytelling - ruins, artifacts, or natural formations that hint at the world's history.",
        type: 'enhancement' as const,
        category: 'Environmental Detail'
      }
    ],
    story: [
      {
        id: '1',
        text: "Try starting in the middle of action and revealing backstory gradually through character actions and dialogue.",
        type: 'alternative' as const,
        category: 'Story Structure'
      },
      {
        id: '2',
        text: "Add subplots that connect to your main theme - if your story is about friendship, include smaller stories about different types of relationships.",
        type: 'expansion' as const,
        category: 'Theme Development'
      },
      {
        id: '3',
        text: "Create plot twists by having characters make choices based on incomplete information or misunderstandings.",
        type: 'enhancement' as const,
        category: 'Plot Development'
      }
    ],
    chapter: [
      {
        id: '1',
        text: "End this chapter with a cliffhanger or unexpected revelation to keep readers engaged.",
        type: 'enhancement' as const,
        category: 'Chapter Endings'
      },
      {
        id: '2',
        text: "Focus on one character's emotional journey through this chapter while advancing the plot.",
        type: 'alternative' as const,
        category: 'Character Focus'
      },
      {
        id: '3',
        text: "Add sensory details to help readers experience the scene - what do characters see, hear, smell, or feel?",
        type: 'enhancement' as const,
        category: 'Descriptive Writing'
      }
    ]
  }

  return baseSuggestions[context as keyof typeof baseSuggestions] || []
}

function getContextTips(context: string): string[] {
  const tips = {
    prompt: [
      "Start with a character who wants something specific",
      "Include a conflict or obstacle that prevents easy success", 
      "Think about what makes your idea unique or unexpected",
      "Consider the emotional journey your character will take"
    ],
    character: [
      "Give characters both strengths and meaningful flaws",
      "Create clear motivations and goals for each character",
      "Think about how characters grow and change",
      "Make sure characters have distinct voices and personalities"
    ],
    world: [
      "Establish clear rules for how your world works",
      "Create believable cultures and social structures",
      "Think about the history that shaped your world",
      "Make sure your world serves the story you want to tell"
    ],
    story: [
      "Show character emotions through actions, not just words",
      "Use dialogue to reveal character and advance plot",
      "Vary your sentence length and structure for better flow",
      "End scenes and chapters with questions or tension"
    ],
    chapter: [
      "Give each chapter a clear purpose or goal",
      "Include conflict or tension to maintain interest",
      "Use specific, concrete details to bring scenes to life",
      "Make sure each chapter moves the story forward"
    ]
  }

  return tips[context as keyof typeof tips] || [
    "Focus on clear, engaging writing",
    "Show don't tell whenever possible", 
    "Create emotional connections with readers",
    "Keep your target audience in mind"
  ]
}