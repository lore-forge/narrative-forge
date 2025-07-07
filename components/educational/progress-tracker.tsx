'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Target, 
  BookOpen, 
  PenTool, 
  Star,
  Award,
  TrendingUp,
  Calendar,
  Brain,
  Heart,
  Lightbulb,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import type { 
  EducationalProgress, 
  SkillAssessment, 
  WritingGoal, 
  Achievement,
  SkillLevel
} from '@/types'

interface ProgressTrackerProps {
  userId: string
  progress: EducationalProgress
  onSetGoal?: (goal: WritingGoal) => void
}

interface SkillMetric {
  name: string
  current: number
  target: number
  icon: any
  color: string
  description: string
}

export function ProgressTracker({ userId, progress, onSetGoal }: ProgressTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month')
  const [showGoalDialog, setShowGoalDialog] = useState(false)

  const skillMetrics: SkillMetric[] = [
    {
      name: 'Vocabulary',
      current: progress.skills.vocabulary,
      target: 100,
      icon: BookOpen,
      color: 'text-blue-500',
      description: 'Range and complexity of words used'
    },
    {
      name: 'Grammar',
      current: progress.skills.grammar,
      target: 100,
      icon: PenTool,
      color: 'text-green-500',
      description: 'Sentence structure and correctness'
    },
    {
      name: 'Creativity',
      current: progress.skills.creativity,
      target: 100,
      icon: Lightbulb,
      color: 'text-yellow-500',
      description: 'Originality and imagination in writing'
    },
    {
      name: 'Structure',
      current: progress.skills.structure,
      target: 100,
      icon: Brain,
      color: 'text-purple-500',
      description: 'Organization and flow of ideas'
    },
    {
      name: 'Character Development',
      current: progress.skills.characterDevelopment,
      target: 100,
      icon: Heart,
      color: 'text-red-500',
      description: 'Creating believable, engaging characters'
    }
  ]

  const recentAchievements = progress.achievements.slice(0, 3)
  const currentGoals = progress.goals.filter(goal => goal.status === 'active')
  const completedStories = progress.completedStories.length
  const totalWordsWritten = progress.writingStats.totalWords
  const averageSessionTime = progress.writingStats.averageSessionMinutes

  const getSkillLevel = (score: number): { level: string, color: string } => {
    if (score >= 90) return { level: 'Expert', color: 'text-purple-600' }
    if (score >= 75) return { level: 'Advanced', color: 'text-blue-600' }
    if (score >= 60) return { level: 'Intermediate', color: 'text-green-600' }
    if (score >= 40) return { level: 'Beginner', color: 'text-yellow-600' }
    return { level: 'Novice', color: 'text-gray-600' }
  }

  const getOverallProgress = (): number => {
    const skillAverage = skillMetrics.reduce((sum, skill) => sum + skill.current, 0) / skillMetrics.length
    return Math.round(skillAverage)
  }

  const getProgressColor = (value: number): string => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-blue-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStreakData = () => {
    const today = new Date()
    const daysBack = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90
    const streak = []
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const hasActivity = progress.writingStats.dailyActivity[date.toISOString().split('T')[0]] > 0
      streak.push({
        date: date.toISOString().split('T')[0],
        hasActivity
      })
    }
    
    return streak
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold">{getOverallProgress()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stories Completed</p>
                <p className="text-2xl font-bold">{completedStories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
                <PenTool className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Words Written</p>
                <p className="text-2xl font-bold">{totalWordsWritten.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Session</p>
                <p className="text-2xl font-bold">{averageSessionTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Writing Skills Progress
              </CardTitle>
              <CardDescription>
                Track your improvement across different writing skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {skillMetrics.map((skill) => {
                const skillLevel = getSkillLevel(skill.current)
                
                return (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <skill.icon className={`w-5 h-5 ${skill.color}`} />
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-gray-500">{skill.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={skillLevel.color}>
                            {skillLevel.level}
                          </Badge>
                          <span className="text-sm font-medium">{skill.current}%</span>
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={skill.current} 
                      className="h-2"
                      // @ts-ignore
                      indicatorClassName={getProgressColor(skill.current)}
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Recent Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Skill Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.assessments.slice(0, 3).map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{assessment.storyTitle}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(assessment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Score: {assessment.overallScore}%
                        </Badge>
                        <TrendingUp className={`w-4 h-4 ${
                          assessment.improvement > 0 ? 'text-green-500' : 'text-gray-400'
                        }`} />
                      </div>
                      {assessment.improvement > 0 && (
                        <p className="text-xs text-green-600">
                          +{assessment.improvement}% improvement
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Writing Goals
                  </CardTitle>
                  <CardDescription>
                    Set and track your writing objectives
                  </CardDescription>
                </div>
                <Button onClick={() => setShowGoalDialog(true)}>
                  <Target className="w-4 h-4 mr-1" />
                  Set Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentGoals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active goals set</p>
                    <p className="text-sm mt-2">Set a goal to track your progress</p>
                  </div>
                ) : (
                  currentGoals.map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {goal.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {goal.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}/{goal.target} {goal.unit}</span>
                        </div>
                        <Progress value={(goal.progress / goal.target) * 100} />
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                          <span>{Math.round((goal.progress / goal.target) * 100)}% complete</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
              </CardTitle>
              <CardDescription>
                Celebrate your writing milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progress.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 border rounded-lg flex items-start gap-3"
                  >
                    <div className={`p-2 rounded ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 dark:bg-purple-900' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 dark:bg-blue-900' :
                      'bg-gray-100 dark:bg-gray-900'
                    }`}>
                      <Trophy className={`w-5 h-5 ${
                        achievement.rarity === 'legendary' ? 'text-yellow-600' :
                        achievement.rarity === 'epic' ? 'text-purple-600' :
                        achievement.rarity === 'rare' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Earned {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Writing Activity
                  </CardTitle>
                  <CardDescription>
                    Your writing consistency over time
                  </CardDescription>
                </div>
                <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                  <TabsList>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="all">3 Months</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {/* Activity Heatmap */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Daily Writing Activity</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm" />
                      <span>No activity</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-200 rounded-sm" />
                      <span>Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-400 rounded-sm" />
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-600 rounded-sm" />
                      <span>High</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getStreakData().map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-sm ${
                        day.hasActivity 
                          ? 'bg-green-400' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      title={`${day.date}: ${day.hasActivity ? 'Active' : 'No activity'}`}
                    />
                  ))}
                </div>

                {/* Writing Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Current Streak
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {progress.writingStats.currentStreak} days
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Longest Streak
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {progress.writingStats.longestStreak} days
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      This Week
                    </p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {progress.writingStats.weeklyActivity} sessions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}