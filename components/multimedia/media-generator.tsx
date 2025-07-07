'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Image as ImageIcon, 
  Volume2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Loader2,
  CheckCircle,
  X,
  Upload,
  Wand2,
  Camera,
  Mic,
  Settings,
  Palette
} from 'lucide-react'
import type { 
  GeneratedImage, 
  AudioNarration, 
  ImageGenerationRequest,
  AudioGenerationRequest 
} from '@/types'

interface MediaGeneratorProps {
  context: 'story' | 'chapter' | 'character' | 'scene'
  storyContent?: string
  onImageGenerated?: (image: GeneratedImage) => void
  onAudioGenerated?: (audio: AudioNarration) => void
}

interface GenerationState {
  isGenerating: boolean
  progress: number
  status: string
  error?: string
}

export function MediaGenerator({ 
  context, 
  storyContent,
  onImageGenerated,
  onAudioGenerated 
}: MediaGeneratorProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [imageState, setImageState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    status: ''
  })
  
  const [audioState, setAudioState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    status: ''
  })
  
  const [imageRequest, setImageRequest] = useState<Partial<ImageGenerationRequest>>({
    prompt: '',
    style: 'realistic',
    aspectRatio: '16:9',
    quality: 'standard',
    ageAppropriate: true
  })
  
  const [audioRequest, setAudioRequest] = useState<Partial<AudioGenerationRequest>>({
    text: storyContent || '',
    voice: 'friendly-narrator',
    speed: 1.0,
    emotion: 'neutral',
    backgroundMusic: false
  })
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [generatedAudio, setGeneratedAudio] = useState<AudioNarration[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<AudioNarration | null>(null)

  const generateImage = async () => {
    if (!imageRequest.prompt?.trim()) return

    setImageState({
      isGenerating: true,
      progress: 0,
      status: 'Initializing image generation...'
    })

    try {
      // Simulate AI image generation progress
      const steps = [
        { progress: 20, status: 'Analyzing prompt...' },
        { progress: 40, status: 'Generating composition...' },
        { progress: 60, status: 'Adding details...' },
        { progress: 80, status: 'Applying style...' },
        { progress: 100, status: 'Finalizing image...' }
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setImageState(prev => ({
          ...prev,
          progress: step.progress,
          status: step.status
        }))
      }

      // Mock generated image
      const generatedImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        url: `https://picsum.photos/800/600?random=${Date.now()}`,
        prompt: imageRequest.prompt,
        style: imageRequest.style || 'realistic',
        aspectRatio: imageRequest.aspectRatio || '16:9',
        generatedAt: new Date(),
        metadata: {
          model: 'dalle-3',
          seed: Math.floor(Math.random() * 1000000),
          steps: 50,
          guidance: 7.5
        }
      }

      setGeneratedImages(prev => [generatedImage, ...prev])
      onImageGenerated?.(generatedImage)

      setImageState({
        isGenerating: false,
        progress: 100,
        status: 'Image generated successfully!'
      })

    } catch (error) {
      setImageState({
        isGenerating: false,
        progress: 0,
        status: '',
        error: error instanceof Error ? error.message : 'Image generation failed'
      })
    }
  }

  const generateAudio = async () => {
    if (!audioRequest.text?.trim()) return

    setAudioState({
      isGenerating: true,
      progress: 0,
      status: 'Initializing audio generation...'
    })

    try {
      // Simulate AI audio generation progress
      const steps = [
        { progress: 25, status: 'Processing text...' },
        { progress: 50, status: 'Generating speech...' },
        { progress: 75, status: 'Adding emotion and pacing...' },
        { progress: 100, status: 'Finalizing audio...' }
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setAudioState(prev => ({
          ...prev,
          progress: step.progress,
          status: step.status
        }))
      }

      // Mock generated audio
      const generatedAudio: AudioNarration = {
        id: `audio-${Date.now()}`,
        url: `https://www.soundjay.com/misc/sounds/bell-ringing-05.wav`, // Mock audio URL
        text: audioRequest.text,
        voice: audioRequest.voice || 'friendly-narrator',
        duration: Math.ceil((audioRequest.text?.length || 0) / 10), // Rough estimation
        generatedAt: new Date(),
        metadata: {
          model: 'eleven-labs',
          voice_id: 'narrator-1',
          emotion: audioRequest.emotion || 'neutral',
          speed: audioRequest.speed || 1.0
        }
      }

      setGeneratedAudio(prev => [generatedAudio, ...prev])
      onAudioGenerated?.(generatedAudio)

      setAudioState({
        isGenerating: false,
        progress: 100,
        status: 'Audio generated successfully!'
      })

    } catch (error) {
      setAudioState({
        isGenerating: false,
        progress: 0,
        status: '',
        error: error instanceof Error ? error.message : 'Audio generation failed'
      })
    }
  }

  const playAudio = (audio: AudioNarration) => {
    if (audioRef.current) {
      if (currentAudio?.id === audio.id && isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.src = audio.url
        audioRef.current.play()
        setIsPlaying(true)
        setCurrentAudio(audio)
      }
    }
  }

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `narrative-image-${image.id}.jpg`
    link.click()
  }

  const downloadAudio = (audio: AudioNarration) => {
    const link = document.createElement('a')
    link.href = audio.url
    link.download = `narrative-audio-${audio.id}.wav`
    link.click()
  }

  const enhancePromptWithAI = async (basePrompt: string) => {
    // Mock AI prompt enhancement
    const enhancements = [
      'cinematic lighting, highly detailed',
      'beautiful artwork, trending on artstation',
      'digital painting, concept art',
      'vibrant colors, fantasy art style',
      'professional illustration, children\'s book style'
    ]
    
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)]
    const enhancedPrompt = `${basePrompt}, ${randomEnhancement}`
    
    setImageRequest(prev => ({ ...prev, prompt: enhancedPrompt }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Audio
          </TabsTrigger>
        </TabsList>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Generate Story Images
              </CardTitle>
              <CardDescription>
                Create AI-generated illustrations for your story
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-prompt">Image Description</Label>
                    <Textarea
                      id="image-prompt"
                      placeholder="Describe the scene you want to visualize..."
                      value={imageRequest.prompt}
                      onChange={(e) => setImageRequest(prev => ({ ...prev, prompt: e.target.value }))}
                      className="min-h-[100px] mt-2"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => enhancePromptWithAI(imageRequest.prompt || '')}
                      className="mt-2"
                      disabled={!imageRequest.prompt?.trim()}
                    >
                      <Wand2 className="w-4 h-4 mr-1" />
                      Enhance with AI
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="image-style">Art Style</Label>
                      <Select 
                        value={imageRequest.style} 
                        onValueChange={(value) => setImageRequest(prev => ({ ...prev, style: value as any }))}
                      >
                        <SelectTrigger id="image-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="cartoon">Cartoon</SelectItem>
                          <SelectItem value="anime">Anime</SelectItem>
                          <SelectItem value="watercolor">Watercolor</SelectItem>
                          <SelectItem value="digital-art">Digital Art</SelectItem>
                          <SelectItem value="children-book">Children's Book</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                      <Select 
                        value={imageRequest.aspectRatio} 
                        onValueChange={(value) => setImageRequest(prev => ({ ...prev, aspectRatio: value as any }))}
                      >
                        <SelectTrigger id="aspect-ratio">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:1">Square (1:1)</SelectItem>
                          <SelectItem value="4:3">Standard (4:3)</SelectItem>
                          <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                          <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="age-appropriate"
                      checked={imageRequest.ageAppropriate}
                      onChange={(e) => setImageRequest(prev => ({ ...prev, ageAppropriate: e.target.checked }))}
                    />
                    <Label htmlFor="age-appropriate" className="text-sm">
                      Ensure age-appropriate content
                    </Label>
                  </div>

                  <Button 
                    onClick={generateImage}
                    disabled={imageState.isGenerating || !imageRequest.prompt?.trim()}
                    className="w-full"
                  >
                    {imageState.isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  {imageState.isGenerating && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Generating Image</span>
                          </div>
                          <Progress value={imageState.progress} />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {imageState.status}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {imageState.error && (
                    <Card className="border-red-200 dark:border-red-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" />
                          <span className="text-sm">{imageState.error}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Generated Images Grid */}
              {generatedImages.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Generated Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedImages.map((image) => (
                      <Card key={image.id}>
                        <CardContent className="p-3">
                          <div className="space-y-3">
                            <img
                              src={image.url}
                              alt={image.prompt}
                              className="w-full h-48 object-cover rounded"
                            />
                            <div>
                              <p className="text-sm font-medium truncate" title={image.prompt}>
                                {image.prompt}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {image.style}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {image.aspectRatio}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadImage(image)}
                                className="flex-1"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onImageGenerated?.(image)}
                              >
                                Use
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Generate Audio Narration
              </CardTitle>
              <CardDescription>
                Create AI-generated narration for your story
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="audio-text">Text to Narrate</Label>
                    <Textarea
                      id="audio-text"
                      placeholder="Enter the text you want to convert to speech..."
                      value={audioRequest.text}
                      onChange={(e) => setAudioRequest(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-[120px] mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="voice">Voice Style</Label>
                      <Select 
                        value={audioRequest.voice} 
                        onValueChange={(value) => setAudioRequest(prev => ({ ...prev, voice: value as any }))}
                      >
                        <SelectTrigger id="voice">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly-narrator">Friendly Narrator</SelectItem>
                          <SelectItem value="warm-storyteller">Warm Storyteller</SelectItem>
                          <SelectItem value="excited-reader">Excited Reader</SelectItem>
                          <SelectItem value="calm-guide">Calm Guide</SelectItem>
                          <SelectItem value="character-voices">Character Voices</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="emotion">Emotion</Label>
                      <Select 
                        value={audioRequest.emotion} 
                        onValueChange={(value) => setAudioRequest(prev => ({ ...prev, emotion: value as any }))}
                      >
                        <SelectTrigger id="emotion">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="happy">Happy</SelectItem>
                          <SelectItem value="excited">Excited</SelectItem>
                          <SelectItem value="mysterious">Mysterious</SelectItem>
                          <SelectItem value="dramatic">Dramatic</SelectItem>
                          <SelectItem value="gentle">Gentle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="speed">Speech Speed: {audioRequest.speed}x</Label>
                    <input
                      type="range"
                      id="speed"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={audioRequest.speed}
                      onChange={(e) => setAudioRequest(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                      className="w-full mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="background-music"
                      checked={audioRequest.backgroundMusic}
                      onChange={(e) => setAudioRequest(prev => ({ ...prev, backgroundMusic: e.target.checked }))}
                    />
                    <Label htmlFor="background-music" className="text-sm">
                      Add subtle background music
                    </Label>
                  </div>

                  <Button 
                    onClick={generateAudio}
                    disabled={audioState.isGenerating || !audioRequest.text?.trim()}
                    className="w-full"
                  >
                    {audioState.isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Generate Audio
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  {audioState.isGenerating && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Generating Audio</span>
                          </div>
                          <Progress value={audioState.progress} />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {audioState.status}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {audioState.error && (
                    <Card className="border-red-200 dark:border-red-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <X className="w-4 h-4" />
                          <span className="text-sm">{audioState.error}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Generated Audio List */}
              {generatedAudio.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Generated Audio</h4>
                  <div className="space-y-3">
                    {generatedAudio.map((audio) => (
                      <Card key={audio.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate" title={audio.text}>
                                {audio.text.substring(0, 60)}...
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {audio.voice}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {audio.duration}s
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {audio.metadata.emotion}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playAudio(audio)}
                              >
                                {currentAudio?.id === audio.id && isPlaying ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadAudio(audio)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  )
}