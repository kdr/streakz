'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { StreakGrid } from '@/components/streak-grid'
import type { Streak } from '@/types/streak'

export default function StreakView() {
  const { id } = useParams()

  const getLocalDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [streak, setStreak] = useState<Streak | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => getLocalDate())

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

  const handleRecordProgress = async (date: string) => {
    try {
      const response = await fetch('/api/streak/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          date
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to record streak')
      }
      
      fetchStreak()
    } catch (error) {
      console.error('Failed to record streak:', error)
    }
  }

  const handleDecrementProgress = async (date: string) => {
    try {
      const response = await fetch('/api/streak/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          date,
          action: 'decrement'
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update streak')
      }
      
      fetchStreak()
    } catch (error) {
      console.error('Failed to update streak:', error)
    }
  }

  const handleClearProgress = async (date: string) => {
    try {
      const response = await fetch('/api/streak/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          date,
          action: 'clear'
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update streak')
      }
      
      fetchStreak()
    } catch (error) {
      console.error('Failed to update streak:', error)
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
      {streak && (
        <StreakGrid
          name={streak.name}
          contributions={streak.contributions}
          onRecordProgress={() => handleRecordProgress(selectedDate)}
          onDecrementProgress={() => handleDecrementProgress(selectedDate)}
          onClearProgress={() => handleClearProgress(selectedDate)}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          currentValue={streak.contributions[selectedDate] || 0}
        />
      )}
    </main>
  )
}

