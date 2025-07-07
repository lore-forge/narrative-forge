'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Users, BookOpen, Palette } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Writing',
      description: 'Generate compelling stories with advanced AI assistance that understands narrative structure and character development.'
    },
    {
      icon: Users,
      title: 'Character Integration',
      description: 'Import characters from RPG Immersive to create stories featuring your favorite characters and their adventures.'
    },
    {
      icon: BookOpen,
      title: 'World Building',
      description: 'Set your stories in richly detailed worlds created with our World Builder module for immersive storytelling.'
    },
    {
      icon: Palette,
      title: 'Multimedia Stories',
      description: 'Enhance your narratives with AI-generated images, audio narration, and interactive elements.'
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Storytelling Features</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to create, share, and enjoy immersive stories powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-narrative-100 dark:bg-narrative-800">
                    <Icon className="w-8 h-8 text-narrative-600 dark:text-narrative-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}