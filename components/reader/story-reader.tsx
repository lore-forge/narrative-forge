'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Pause, 
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Settings,
  Eye,
  Moon,
  Sun,
  Type,
  Palette,
  ArrowLeft,
  ArrowRight,
  Home,
  List
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { GeneratedStory, Chapter, ReaderSettings } from '@/types'

interface StoryReaderProps {
  story: GeneratedStory
  initialChapter?: number
  onProgress?: (chapterIndex: number, progress: number) => void
  onComplete?: () => void
  settings?: Partial<ReaderSettings>
}

interface ReadingState {
  currentChapter: number
  readingProgress: number
  isReading: boolean
  readingSpeed: number
  autoScroll: boolean
}

export function StoryReader({ 
  story, 
  initialChapter = 0,
  onProgress,
  onComplete,
  settings: initialSettings
}: StoryReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [readingState, setReadingState] = useState<ReadingState>({
    currentChapter: initialChapter,
    readingProgress: 0,
    isReading: false,
    readingSpeed: 200, // words per minute
    autoScroll: false
  })
  
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>({
    fontSize: 16,
    fontFamily: 'serif',
    theme: 'light',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    lineHeight: 1.6,
    columnWidth: 'single',
    showProgress: true,
    enableAudio: true,
    autoBookmark: true,
    ...initialSettings
  })
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showChapterList, setShowChapterList] = useState(false)

  const currentChapter = story.chapters[readingState.currentChapter]
  const totalChapters = story.chapters.length

  useEffect(() => {
    const savedProgress = localStorage.getItem(`story-progress-${story.id}`)
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setReadingState(prev => ({
        ...prev,
        currentChapter: progress.chapter || 0,
        readingProgress: progress.progress || 0
      }))
    }

    const savedBookmarks = localStorage.getItem(`story-bookmarks-${story.id}`)
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
  }, [story.id])

  useEffect(() => {
    if (readerSettings.autoBookmark) {
      saveProgress()
    }
  }, [readingState.currentChapter, readingState.readingProgress])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const saveProgress = () => {
    const progress = {
      chapter: readingState.currentChapter,
      progress: readingState.readingProgress,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(`story-progress-${story.id}`, JSON.stringify(progress))
    onProgress?.(readingState.currentChapter, readingState.readingProgress)
  }

  const saveBookmarks = (newBookmarks: number[]) => {
    localStorage.setItem(`story-bookmarks-${story.id}`, JSON.stringify(newBookmarks))
    setBookmarks(newBookmarks)
  }

  const toggleBookmark = () => {
    const currentPosition = readingState.currentChapter
    const isBookmarked = bookmarks.includes(currentPosition)
    
    if (isBookmarked) {
      saveBookmarks(bookmarks.filter(b => b !== currentPosition))
    } else {
      saveBookmarks([...bookmarks, currentPosition])
    }
  }

  const nextChapter = () => {
    if (readingState.currentChapter < totalChapters - 1) {
      setReadingState(prev => ({
        ...prev,
        currentChapter: prev.currentChapter + 1,
        readingProgress: 0
      }))
    } else {
      onComplete?.()
    }
  }

  const previousChapter = () => {
    if (readingState.currentChapter > 0) {
      setReadingState(prev => ({
        ...prev,
        currentChapter: prev.currentChapter - 1,
        readingProgress: 0
      }))
    }
  }

  const goToChapter = (chapterIndex: number) => {
    setReadingState(prev => ({
      ...prev,
      currentChapter: chapterIndex,
      readingProgress: 0
    }))
    setShowChapterList(false)
  }

  const toggleAudio = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const updateAudioProgress = () => {
    if (!audioRef.current) return
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
    setAudioProgress(progress)
  }

  const seekAudio = (value: number[]) => {
    if (!audioRef.current) return
    const seekTime = (value[0] / 100) * audioRef.current.duration
    audioRef.current.currentTime = seekTime
    setAudioProgress(value[0])
  }

  const getReadingTheme = () => {
    switch (readerSettings.theme) {
      case 'dark':
        return {
          backgroundColor: '#1a1a1a',
          color: '#e5e5e5',
          borderColor: '#374151'
        }
      case 'sepia':
        return {
          backgroundColor: '#f7f3e3',
          color: '#5d4e37',
          borderColor: '#d4c5a8'
        }
      default:
        return {
          backgroundColor: readerSettings.backgroundColor,
          color: readerSettings.textColor,
          borderColor: '#e5e7eb'
        }
    }
  }

  const themeStyles = getReadingTheme()

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              
              <div>
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chapter {readingState.currentChapter + 1} of {totalChapters}: {currentChapter?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chapter Navigation */}
              <Popover open={showChapterList} onOpenChange={setShowChapterList}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <List className="w-4 h-4 mr-1" />
                    Chapters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium">Chapter List</h4>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {story.chapters.map((chapter, index) => (
                        <button
                          key={index}
                          onClick={() => goToChapter(index)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            index === readingState.currentChapter
                              ? 'bg-narrative-100 dark:bg-narrative-800'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="font-medium">Chapter {index + 1}</div>
                          <div className="text-gray-600 dark:text-gray-400 truncate">
                            {chapter.title}
                          </div>
                          {bookmarks.includes(index) && (
                            <BookmarkCheck className="w-3 h-3 inline ml-1 text-narrative-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Bookmark */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBookmark}
                className={bookmarks.includes(readingState.currentChapter) ? 'text-narrative-500' : ''}
              >
                {bookmarks.includes(readingState.currentChapter) ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>

              {/* Settings */}
              <Popover open={showSettings} onOpenChange={setShowSettings}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Reading Settings</h4>
                    
                    {/* Theme */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Theme</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'light', icon: Sun, label: 'Light' },
                          { value: 'dark', icon: Moon, label: 'Dark' },
                          { value: 'sepia', icon: Eye, label: 'Sepia' }
                        ].map(({ value, icon: Icon, label }) => (
                          <Button
                            key={value}
                            variant={readerSettings.theme === value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setReaderSettings(prev => ({ ...prev, theme: value as any }))}
                          >
                            <Icon className="w-4 h-4 mr-1" />
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Font Size: {readerSettings.fontSize}px</label>
                      <Slider
                        value={[readerSettings.fontSize]}
                        onValueChange={(value) => setReaderSettings(prev => ({ ...prev, fontSize: value[0] }))}
                        min={12}
                        max={24}
                        step={1}
                      />
                    </div>

                    {/* Font Family */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Font Family</label>
                      <Select 
                        value={readerSettings.fontFamily} 
                        onValueChange={(value) => setReaderSettings(prev => ({ ...prev, fontFamily: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="monospace">Monospace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Line Height */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Line Height: {readerSettings.lineHeight}</label>
                      <Slider
                        value={[readerSettings.lineHeight]}
                        onValueChange={(value) => setReaderSettings(prev => ({ ...prev, lineHeight: value[0] }))}
                        min={1.2}
                        max={2.0}
                        step={0.1}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Progress Bar */}
          {readerSettings.showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Chapter Progress</span>
                <span>{Math.round(readingState.readingProgress)}%</span>
              </div>
              <Progress value={readingState.readingProgress} className="h-1" />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Overall Progress</span>
                <span>
                  {Math.round(((readingState.currentChapter + (readingState.readingProgress / 100)) / totalChapters) * 100)}%
                </span>
              </div>
              <Progress 
                value={((readingState.currentChapter + (readingState.readingProgress / 100)) / totalChapters) * 100} 
                className="h-1" 
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Reading Area */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{
          backgroundColor: themeStyles.backgroundColor,
          color: themeStyles.color
        }}
      >
        <div className="max-w-4xl mx-auto p-6">
          <article
            ref={contentRef}
            className="prose max-w-none"
            style={{
              fontSize: `${readerSettings.fontSize}px`,
              fontFamily: readerSettings.fontFamily,
              lineHeight: readerSettings.lineHeight,
              color: themeStyles.color
            }}
          >
            {/* Chapter Title */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: themeStyles.color }}>
                {currentChapter?.title}
              </h1>
              {currentChapter?.summary && (
                <p className="text-lg text-gray-600 dark:text-gray-400 italic">
                  {currentChapter.summary}
                </p>
              )}
            </header>

            {/* Chapter Content */}
            <div 
              className="chapter-content"
              dangerouslySetInnerHTML={{ __html: currentChapter?.content || '' }}
            />

            {/* Interactive Elements */}
            {currentChapter?.interactiveElements && currentChapter.interactiveElements.length > 0 && (
              <div className="my-8 p-4 border rounded-lg" style={{ borderColor: themeStyles.borderColor }}>
                <h3 className="text-lg font-medium mb-4">Interactive Elements</h3>
                <div className="space-y-4">
                  {currentChapter.interactiveElements.map((element, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="mb-2">{element.prompt}</p>
                      {element.type === 'choice' && element.choices && (
                        <div className="space-y-2">
                          {element.choices.map((choice, choiceIndex) => (
                            <button
                              key={choiceIndex}
                              className="block w-full text-left p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              style={{ borderColor: themeStyles.borderColor }}
                            >
                              {choice.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {currentChapter?.images && currentChapter.images.length > 0 && (
              <div className="my-8 space-y-4">
                {currentChapter.images.map((image, index) => (
                  <figure key={index} className="text-center">
                    <img 
                      src={image.url} 
                      alt={image.description}
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                    />
                    {image.caption && (
                      <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>

      {/* Audio Controls */}
      {readerSettings.enableAudio && currentChapter?.audioUrl && (
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <div className="flex-1">
                <Slider
                  value={[audioProgress]}
                  onValueChange={seekAudio}
                  max={100}
                  step={0.1}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => setVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="w-20"
                />
              </div>
            </div>

            <audio
              ref={audioRef}
              src={currentChapter.audioUrl}
              onTimeUpdate={updateAudioProgress}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation Footer */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousChapter}
              disabled={readingState.currentChapter === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous Chapter
            </Button>

            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Chapter {readingState.currentChapter + 1} of {totalChapters}
              </Badge>
              
              {story.estimatedReadTime && (
                <Badge variant="outline">
                  ~{story.estimatedReadTime} min read
                </Badge>
              )}
            </div>

            <Button
              variant="outline"
              onClick={nextChapter}
              disabled={readingState.currentChapter === totalChapters - 1}
            >
              Next Chapter
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}