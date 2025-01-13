'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Goal } from '@/components/goal'
import { StreakGrid } from '@/components/streak-grid'
import { ProgressRing } from '@/components/ui/progress-ring'
import { GoalLineChart } from '@/components/goal-line-chart'
import { Button } from '@/components/ui/button'
import type { Goal as GoalType } from '@/types/streak'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

const GOAL_COLORS = [
  'bg-green-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-orange-600',
  'bg-teal-600'
]

const RING_COLORS = [
  'stroke-green-600',
  'stroke-blue-600',
  'stroke-purple-600',
  'stroke-pink-600',
  'stroke-orange-600',
  'stroke-teal-600'
]

const LINE_COLORS = [
  '#16a34a', // green-600
  '#2563eb', // blue-600
  '#9333ea', // purple-600
  '#db2777', // pink-600
  '#ea580c', // orange-600
  '#0d9488', // teal-600
]

type ViewType = 'progress' | 'streak' | 'ring' | 'chart'
type TimeRange = 'ytd' | 'week' | 'month' | '90days' | 'year'

interface GoalSetResponse {
  name: string
  goals: GoalType[]
}

export default function GoalSetView() {
  const { id } = useParams()
  const [goalSet, setGoalSet] = useState<GoalSetResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<ViewType>('progress')
  const [timeRange, setTimeRange] = useState<TimeRange>('ytd')
  const [showTarget, setShowTarget] = useState(false)

  const fetchGoalSet = useCallback(async () => {
    try {
      const response = await fetch(`/api/goals?id=${id}`)
      const data = await response.json()
      setGoalSet(data)
    } catch (error) {
      console.error('Failed to fetch goal set:', error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const handleRecordProgress = async (goalId: string, date: string, value: number) => {
    try {
      const response = await fetch('/api/goal/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: goalId,
          date,
          value
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to record progress')
      }
      
      fetchGoalSet()
    } catch (error) {
      console.error('Failed to record progress:', error)
    }
  }

  const handleShare = async () => {
    try {
      const response = await fetch('/api/read-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: id,
          type: 'goalSet'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create read-only view')
      }

      const { id: readOnlyId } = await response.json()
      window.location.href = `/view/goals/${readOnlyId}`
    } catch (error) {
      console.error('Failed to create read-only view:', error)
    }
  }

  useEffect(() => {
    fetchGoalSet()
  }, [fetchGoalSet])

  useEffect(() => {
    if (goalSet?.name) {
      document.title = `${goalSet.name} | Goal Set`
    }
  }, [goalSet?.name])

  if (isLoading) return <div>Loading...</div>
  if (!goalSet) return <div>Goal set not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">{goalSet?.name}</h1>
          <Button variant="outline" onClick={handleShare}>
            Share as Read-only
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Button
              variant={viewType === 'progress' ? 'default' : 'outline'}
              onClick={() => setViewType('progress')}
            >
              Summary View
            </Button>
            <Button
              variant={viewType === 'chart' ? 'default' : 'outline'}
              onClick={() => setViewType('chart')}
            >
              Trends
            </Button>
            <Button
              variant={viewType === 'ring' ? 'default' : 'outline'}
              onClick={() => setViewType('ring')}
            >
              Ring View
            </Button>
            <Button
              variant={viewType === 'streak' ? 'default' : 'outline'}
              onClick={() => setViewType('streak')}
            >
              Streak View
            </Button>
          </div>
          {viewType === 'chart' && (
            <>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === 'ytd' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('ytd')}
                >
                  YTD
                </Button>
                <Button
                  variant={timeRange === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('year')}
                >
                  Full Year
                </Button>
                <Button
                  variant={timeRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  Last Week
                </Button>
                <Button
                  variant={timeRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  Last Month
                </Button>
                <Button
                  variant={timeRange === '90days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('90days')}
                >
                  Last 90 Days
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showTarget ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowTarget(!showTarget)}
                >
                  {showTarget ? 'Hide Target Line' : 'Show Target Line'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {goalSet?.goals.map((goal, index) => {
          const color = GOAL_COLORS[index % GOAL_COLORS.length]
          const ringColor = RING_COLORS[index % RING_COLORS.length]
          const lineColor = LINE_COLORS[index % LINE_COLORS.length]
          const totalProgress = Object.values(goal.progress).reduce((sum, val) => sum + val, 0)

          if (viewType === 'chart') {
            return (
              <div key={goal.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{goal.name}</h2>
                    <span className="text-sm text-muted-foreground">
                      Progress: {totalProgress.toFixed(2)} / {goal.targetValue}
                    </span>
                  </div>
                  <Link href={`/goal/${goal.id}`} className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
                <GoalLineChart
                  goal={goal}
                  color={lineColor}
                  timeRange={timeRange}
                  showTarget={showTarget}
                />
              </div>
            )
          }

          if (viewType === 'ring') {
            return (
              <div key={goal.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{goal.name}</h2>
                  </div>
                  <Link href={`/goal/${goal.id}`} className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex justify-center">
                  <ProgressRing
                    value={totalProgress}
                    max={goal.targetValue}
                    color={ringColor}
                    size={150}
                  />
                </div>
              </div>
            )
          }

          if (viewType === 'streak') {
            return (
              <div key={goal.id} className="relative">
                <Link href={`/goal/${goal.id}`} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <StreakGrid
                  name={goal.name}
                  contributions={goal.progress}
                  color={color}
                />
              </div>
            )
          }

          return (
            <div key={goal.id} className="relative">
              <Link href={`/goal/${goal.id}`} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Goal
                goal={goal}
                onRecordProgress={(date, value) => handleRecordProgress(goal.id, date, value)}
                color={color}
                showDetails={false}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
} 