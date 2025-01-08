'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { TrackedValueSummary } from '@/components/tracked-value-summary'
import type { TrackedValue } from '@/types/streak'

export default function TrackedValueView() {
  const { id } = useParams()
  const [trackedValue, setTrackedValue] = useState<TrackedValue | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTrackedValue = useCallback(async () => {
    try {
      const response = await fetch(`/api/tracked-value?id=${id}`)
      const data = await response.json()
      setTrackedValue(data)
    } catch (error) {
      console.error('Failed to fetch tracked value:', error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const handleRecordValue = async (date: string, value: number) => {
    try {
      const response = await fetch('/api/tracked-value/record', {
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
        throw new Error(data.error || 'Failed to record value')
      }
      
      fetchTrackedValue()
    } catch (error) {
      console.error('Failed to record value:', error)
    }
  }

  useEffect(() => {
    fetchTrackedValue()
  }, [fetchTrackedValue])

  useEffect(() => {
    if (trackedValue?.name) {
      document.title = `${trackedValue.name} | Value Tracker`
    }
  }, [trackedValue?.name])

  if (isLoading) return <div>Loading...</div>
  if (!trackedValue) return <div>Value tracker not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      {trackedValue && (
        <TrackedValueSummary
          trackedValue={trackedValue}
          onRecordValue={handleRecordValue}
        />
      )}
    </main>
  )
} 