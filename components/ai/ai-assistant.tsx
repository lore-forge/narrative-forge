'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Lightbulb, RefreshCw } from 'lucide-react'

interface AIAssistantProps {
  context: string
  onSuggestion: (suggestion: string) => void
}

export function AIAssistant({ context: _context, onSuggestion }: AIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions] = useState([
    'A young wizard discovers a hidden library that contains books that can bring stories to life...',
    'In a world where memories can be extracted and traded, a memory thief discovers their own forgotten past...',
    'A group of children find a magical door in their school that leads to different time periods...'
  ])

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true)
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    onSuggestion(randomSuggestion)
    setIsGenerating(false)
  }

  return (
    <Card className="border-narrative-200 dark:border-narrative-700 bg-narrative-50/50 dark:bg-narrative-900/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-narrative-100 dark:bg-narrative-800">
            <Sparkles className="w-5 h-5 text-narrative-600 dark:text-narrative-400" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-2">AI Writing Assistant</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Need inspiration? Let me help you develop your story idea with creative suggestions.
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSuggestion}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
                {isGenerating ? 'Thinking...' : 'Get Suggestion'}
              </Button>
              
              <Button variant="ghost" size="sm" disabled>
                Enhance Prompt
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}