'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Goal } from '@/components/goal'
import { ProgressRing } from '@/components/ui/progress-ring'
import { GoalLineChart } from '@/components/goal-line-chart'
import type { Goal as GoalType } from '@/types/streak'

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

export default function ReadOnlyGoalSetView() {
  const { id } = useParams()
  const [goalSet, setGoalSet] = useState<{ name: string; goals: GoalType[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<ViewType>('progress')
  const [timeRange, setTimeRange] = useState<TimeRange>('ytd')
  const [showTarget, setShowTarget] = useState(false)

  useEffect(() => {
    const fetchGoalSet = async () => {
      try {
        const response = await fetch(`/api/goals/read-only?id=${id}`)
        const data = await response.json()
        setGoalSet(data)
      } catch (error) {
        console.error('Failed to fetch goal set:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoalSet()
  }, [id])

  useEffect(() => {
    if (goalSet?.name) {
      document.title = `${goalSet.name} | Goals View`
    }
  }, [goalSet?.name])

  if (isLoading) return <div>Loading...</div>
  if (!goalSet) return <div>Goal set not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{goalSet.name}</h1>
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg ${viewType === 'progress' ? 'bg-primary text-primary-foreground' : 'border'}`}
              onClick={() => setViewType('progress')}
            >
              Progress Bars
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${viewType === 'ring' ? 'bg-primary text-primary-foreground' : 'border'}`}
              onClick={() => setViewType('ring')}
            >
              Ring View
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${viewType === 'chart' ? 'bg-primary text-primary-foreground' : 'border'}`}
              onClick={() => setViewType('chart')}
            >
              Line Chart
            </button>
          </div>
          {viewType === 'chart' && (
            <>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'ytd' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('ytd')}
                >
                  YTD
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'year' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('year')}
                >
                  Full Year
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'week' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('week')}
                >
                  Last Week
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'month' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('month')}
                >
                  Last Month
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === '90days' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('90days')}
                >
                  Last 90 Days
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${showTarget ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setShowTarget(!showTarget)}
                >
                  {showTarget ? 'Hide Target Line' : 'Show Target Line'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {goalSet.goals.map((goal, index) => {
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
                <div>
                  <h2 className="text-2xl font-bold">{goal.name}</h2>
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

          return (
            <div key={goal.id}>
              <Goal
                goal={goal}
                color={color}
                showDetails={false}
                isReadOnly={true}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
} 