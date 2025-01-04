'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { StreakGrid } from '@/components/streak-grid'
import type { Streak } from '@/types/streak'

export default function StreakView() {
  const { id } = useParams()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStreak = useCallback(async () => {
    try {
      const response = await fetch(`/api/streak?id=${id}&year=${new Date().getFullYear()}`)
      const data = await response.json()
      setStreak(data)
    } catch (error) {
      console.error('Failed to fetch streak:', error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const handleRecordToday = async () => {
    try {
      await fetch('/api/streak/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchStreak()
    } catch (error) {
      console.error('Failed to record streak:', error)
    }
  }

  const handleUndoToday = async () => {
    try {
      await fetch('/api/streak/record', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchStreak()
    } catch (error) {
      console.error('Failed to undo streak:', error)
    }
  }

  useEffect(() => {
    fetchStreak()
  }, [fetchStreak])

  useEffect(() => {
    if (streak?.name) {
      document.title = `${streak.name} | Streakz`
    }
  }, [streak?.name])

  if (isLoading) return <div>Loading...</div>
  if (!streak) return <div>Streak not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <StreakGrid
        name={streak.name}
        contributions={streak.contributions}
        onRecordToday={handleRecordToday}
        onUndoToday={handleUndoToday}
      />
    </main>
  )
}

