'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, Sparkles, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity
      }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-narrative-50 via-white to-story-50 dark:from-narrative-950 dark:via-gray-900 dark:to-story-950">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-narrative-200/20 rounded-full blur-3xl dark:bg-narrative-800/20" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-story-200/20 rounded-full blur-3xl dark:bg-story-800/20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-chapter-200/10 rounded-full blur-3xl dark:bg-chapter-800/10" />
      </div>

      {/* Floating Elements */}
      <motion.div
        variants={floatingVariants}
        animate="float"
        className="absolute top-1/4 left-1/4 text-narrative-300 dark:text-narrative-700"
      >
        <BookOpen size={24} />
      </motion.div>
      
      <motion.div
        variants={floatingVariants}
        animate="float"
        style={{ animationDelay: '1s' }}
        className="absolute top-1/3 right-1/4 text-story-300 dark:text-story-700"
      >
        <Sparkles size={20} />
      </motion.div>

      <motion.div
        variants={floatingVariants}
        animate="float"
        style={{ animationDelay: '2s' }}
        className="absolute bottom-1/3 left-1/5 text-chapter-300 dark:text-chapter-700"
      >
        <Zap size={18} />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge className="mb-6 bg-narrative-100 text-narrative-700 hover:bg-narrative-200 dark:bg-narrative-800 dark:text-narrative-300">
              <Sparkles className="w-4 h-4 mr-2" />
              The 5th AI Agent: Narrative Weaver
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-narrative-600 via-story-600 to-chapter-600 bg-clip-text text-transparent">
                Narrative Forge
              </span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 font-narrative">
              AI-Powered Storytelling for Young Creators
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Transform simple ideas into immersive stories with AI assistance. 
            Import characters from RPG adventures, set tales in crafted worlds, 
            and learn creative writing through intelligent guidance designed for ages 8-14.
          </motion.p>

          {/* Feature Highlights */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
          >
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-narrative-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Cross-Module Integration</span>
            </div>
            
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <Users className="w-6 h-6 text-story-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Educational AI Guidance</span>
            </div>
            
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-chapter-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Multimedia Storytelling</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
          >
            <Link href="/stories/create">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-narrative-500 to-story-500 hover:from-narrative-600 hover:to-story-600 text-white px-8 py-4 text-lg"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Start Creating Stories
                <ArrowRight 
                  className={`ml-2 w-5 h-5 transition-transform duration-300 ${
                    isHovered ? 'translate-x-1' : ''
                  }`} 
                />
              </Button>
            </Link>
            
            <Link href="/demo">
              <Button 
                variant="outline" 
                size="lg"
                className="border-narrative-300 text-narrative-700 hover:bg-narrative-50 dark:border-narrative-600 dark:text-narrative-300 dark:hover:bg-narrative-900 px-8 py-4 text-lg"
              >
                Try Demo
              </Button>
            </Link>
          </motion.div>

          {/* Integration Notice */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 p-6 rounded-xl bg-gradient-to-r from-narrative-100/50 to-story-100/50 dark:from-narrative-900/50 dark:to-story-900/50 backdrop-blur-sm border border-narrative-200/50 dark:border-narrative-700/50"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Seamlessly Integrated with Lore Forge Ecosystem
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-narrative-400 rounded-full" />
                RPG Immersive Characters
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-story-400 rounded-full" />
                World Builder Environments
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-chapter-400 rounded-full" />
                AI Services Library
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-gray-900 dark:via-gray-900/50 dark:to-transparent" />
    </section>
  )
}