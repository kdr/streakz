'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Goal } from '@/components/goal'
import { GoalLineChart } from '@/components/goal-line-chart'
import type { Goal as GoalType } from '@/types/streak'
import type { TimeRange } from '@/components/goal-line-chart'

export default function GoalView() {
  const { id } = useParams()
  const [goal, setGoal] = useState<GoalType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'summary' | 'chart'>('summary')
  const [timeRange, setTimeRange] = useState<TimeRange>('ytd')
  const [showTargetLine, setShowTargetLine] = useState(true)

  const fetchGoal = useCallback(async () => {
    try {
      const response = await fetch(`/api/goal?id=${id}`)
      const data = await response.json()
      setGoal(data)
    } catch (error) {
      console.error('Failed to fetch goal:', error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const handleRecordProgress = async (date: string, value: number) => {
    try {
      const response = await fetch('/api/goal/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          date,
          value
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to record progress')
      }
      
      fetchGoal()
    } catch (error) {
      console.error('Failed to record progress:', error)
    }
  }

  useEffect(() => {
    fetchGoal()
  }, [fetchGoal])

  useEffect(() => {
    if (goal?.name) {
      document.title = `${goal.name} | Goal Tracker`
    }
  }, [goal?.name])

  if (isLoading) return <div>Loading...</div>
  if (!goal) return <div>Goal not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      {goal && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'summary' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                Summary View
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'chart' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                Trends
              </button>
            </div>
            {viewMode === 'chart' && (
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => setShowTargetLine(!showTargetLine)}
                  className={`px-3 py-1 rounded-md ${
                    showTargetLine 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  Target Line
                </button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800"
                >
                  <option value="ytd">Year to Date</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">Full Year</option>
                </select>
              </div>
            )}
          </div>
          {viewMode === 'summary' ? (
            <Goal
              goal={goal}
              onRecordProgress={handleRecordProgress}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h2 className="text-xl font-semibold mb-4">{goal.name}</h2>
              <GoalLineChart
                goal={goal}
                timeRange={timeRange}
                showTarget={showTargetLine}
              />
            </div>
          )}
        </>
      )}
    </main>
  )
} 