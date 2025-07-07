'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Sparkles,
  Wand2,
  MessageSquare,
  BookOpen,
  Save,
  Undo,
  Redo,
  Type,
  Palette
} from 'lucide-react'
import { AIAssistant } from '@/components/ai/ai-assistant'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  context: 'chapter' | 'story' | 'character-description'
  onSave?: () => void
  autoSave?: boolean
}

interface EditorState {
  content: string
  history: string[]
  historyIndex: number
  wordCount: number
  characterCount: number
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing your story...",
  context,
  onSave,
  autoSave = true
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorState, setEditorState] = useState<EditorState>({
    content,
    history: [content],
    historyIndex: 0,
    wordCount: 0,
    characterCount: 0
  })
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')

  useEffect(() => {
    updateWordCount()
  }, [editorState.content])

  useEffect(() => {
    if (autoSave) {
      const autoSaveTimer = setTimeout(() => {
        onSave?.()
      }, 2000)
      return () => clearTimeout(autoSaveTimer)
    }
  }, [editorState.content, autoSave, onSave])

  const updateWordCount = () => {
    const text = editorState.content.replace(/<[^>]*>/g, '')
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const characters = text.length
    
    setEditorState(prev => ({
      ...prev,
      wordCount: words,
      characterCount: characters
    }))
  }

  const handleContentChange = () => {
    if (!editorRef.current) return
    
    const newContent = editorRef.current.innerHTML
    const newState = {
      ...editorState,
      content: newContent,
      history: [...editorState.history.slice(0, editorState.historyIndex + 1), newContent],
      historyIndex: editorState.historyIndex + 1
    }
    
    setEditorState(newState)
    onChange(newContent)
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentChange()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          onSave?.()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
          break
        case 'y':
          e.preventDefault()
          redo()
          break
        case 'b':
          e.preventDefault()
          execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          execCommand('italic')
          break
        case 'u':
          e.preventDefault()
          execCommand('underline')
          break
      }
    }
  }

  const undo = () => {
    if (editorState.historyIndex > 0) {
      const newIndex = editorState.historyIndex - 1
      const newContent = editorState.history[newIndex]
      
      setEditorState(prev => ({
        ...prev,
        content: newContent,
        historyIndex: newIndex
      }))
      
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent
      }
      onChange(newContent)
    }
  }

  const redo = () => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      const newIndex = editorState.historyIndex + 1
      const newContent = editorState.history[newIndex]
      
      setEditorState(prev => ({
        ...prev,
        content: newContent,
        historyIndex: newIndex
      }))
      
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent
      }
      onChange(newContent)
    }
  }

  const getSelectedText = () => {
    const selection = window.getSelection()
    return selection?.toString() || ''
  }

  const insertImage = async () => {
    if (!imagePrompt.trim()) return
    
    try {
      // Mock image generation - replace with actual AI image service
      const imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`
      const imageHtml = `<img src="${imageUrl}" alt="${imagePrompt}" style="max-width: 100%; height: auto; margin: 1rem 0;" />`
      
      execCommand('insertHTML', imageHtml)
      setImagePrompt('')
      setShowImageDialog(false)
    } catch (error) {
      console.error('Failed to generate image:', error)
    }
  }

  const enhanceWithAI = async (instruction: string) => {
    const selection = getSelectedText()
    const contextText = selection || editorState.content
    
    try {
      // Mock AI enhancement - replace with actual AI service
      const enhancedText = `Enhanced: ${contextText} (${instruction})`
      
      if (selection) {
        execCommand('insertText', enhancedText)
      } else {
        execCommand('insertHTML', `<p>${enhancedText}</p>`)
      }
    } catch (error) {
      console.error('AI enhancement failed:', error)
    }
  }

  const formatButtons = [
    { icon: Bold, command: 'bold', tooltip: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', tooltip: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', tooltip: 'Underline (Ctrl+U)' }
  ]

  const structureButtons = [
    { icon: Heading1, command: 'formatBlock', value: 'h1', tooltip: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', tooltip: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', tooltip: 'Heading 3' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', tooltip: 'Quote' }
  ]

  return (
    <Card className="w-full border-narrative-200 dark:border-narrative-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="w-5 h-5 text-narrative-500" />
            Story Editor
            <Badge variant="secondary" className="ml-2">
              {context}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 space-x-4">
              <span>{editorState.wordCount} words</span>
              <span>{editorState.characterCount} characters</span>
            </div>
            
            {onSave && (
              <Button size="sm" variant="outline" onClick={onSave}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          {/* Undo/Redo */}
          <Button
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={editorState.historyIndex <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={editorState.historyIndex >= editorState.history.length - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Formatting */}
          {formatButtons.map(({ icon: Icon, command, tooltip }) => (
            <Button
              key={command}
              size="sm"
              variant="ghost"
              onClick={() => execCommand(command)}
              title={tooltip}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Structure */}
          {structureButtons.map(({ icon: Icon, command, value, tooltip }) => (
            <Button
              key={command + value}
              size="sm"
              variant="ghost"
              onClick={() => execCommand(command, value)}
              title={tooltip}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Media & AI */}
          <Popover open={showImageDialog} onOpenChange={setShowImageDialog}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" title="Insert AI Image">
                <Image className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-medium">Generate Image</h4>
                <Input
                  placeholder="Describe the image you want..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={insertImage} disabled={!imagePrompt.trim()}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowImageDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
            title="AI Writing Assistant"
            className={isAIAssistantOpen ? 'bg-narrative-100 dark:bg-narrative-800' : ''}
          >
            <Wand2 className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Assistant */}
        {isAIAssistantOpen && (
          <AIAssistant
            context={context}
            currentText={getSelectedText() || editorState.content}
            onSuggestion={(suggestion) => {
              const selection = getSelectedText()
              if (selection) {
                execCommand('insertText', suggestion)
              } else {
                execCommand('insertHTML', `<p>${suggestion}</p>`)
              }
            }}
            placeholder="Select text and ask for improvements, or describe what you want to write..."
          />
        )}

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[400px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-narrative-500 focus:border-transparent prose prose-sm dark:prose-invert max-w-none"
          style={{
            lineHeight: '1.6',
            fontSize: '16px'
          }}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onMouseUp={() => setSelectedText(getSelectedText())}
          dangerouslySetInnerHTML={{ __html: content || `<p>${placeholder}</p>` }}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
          <div className="flex items-center gap-4">
            <span>Ready</span>
            {autoSave && <span>Auto-save enabled</span>}
            {selectedText && <span>Selected: {selectedText.length} characters</span>}
          </div>
          
          <div className="flex items-center gap-4">
            <span>Line 1, Column 1</span>
            <span>{editorState.wordCount} words</span>
            <span>{editorState.characterCount} characters</span>
          </div>
        </div>

        {/* Quick AI Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => enhanceWithAI('make more descriptive')}
            disabled={!selectedText}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Enhance Description
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => enhanceWithAI('add dialogue')}
            disabled={!selectedText}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Add Dialogue
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => enhanceWithAI('continue the story')}
          >
            <BookOpen className="w-3 h-3 mr-1" />
            Continue Story
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}