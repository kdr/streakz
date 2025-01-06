'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Goal } from '@/components/goal'
import type { Goal as GoalType } from '@/types/streak'

export default function GoalView() {
  const { id } = useParams()
  const [goal, setGoal] = useState<GoalType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        <Goal
          goal={goal}
          onRecordProgress={handleRecordProgress}
        />
      )}
    </main>
  )
} 