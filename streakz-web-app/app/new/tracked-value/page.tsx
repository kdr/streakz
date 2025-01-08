'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format, startOfYear } from 'date-fns'

export default function NewTrackedValue() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [startValue, setStartValue] = useState('')
  const [startDate, setStartDate] = useState(() => format(startOfYear(new Date()), 'yyyy-MM-dd'))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tracked-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          targetValue: Number(targetValue),
          ...(startValue && { startValue: Number(startValue) }),
          ...(startDate && { startDate })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tracked value')
      }

      if (!data.id) {
        throw new Error('No tracked value ID received')
      }

      router.push(`/tracked-value/${data.id}`)
    } catch (error) {
      console.error('Failed to create tracked value:', error)
      setError(error instanceof Error ? error.message : 'Failed to create tracked value')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create a Value Tracker</h1>
      <p className="text-lg mb-8">
        Track a value that changes over time, like weight, savings, or any other metric where you want to record
        the current value rather than accumulating progress.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name your tracker</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weight in KG"
            required
          />
        </div>
        <div>
          <Label htmlFor="targetValue">Target Value</Label>
          <Input
            id="targetValue"
            type="number"
            step="any"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="e.g., 70"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            The value you want to reach or maintain.
          </p>
        </div>
        <div>
          <Label htmlFor="startValue">Starting Value (Optional)</Label>
          <Input
            id="startValue"
            type="number"
            step="any"
            value={startValue}
            onChange={(e) => setStartValue(e.target.value)}
            placeholder="e.g., 80"
          />
          <p className="text-sm text-muted-foreground mt-1">
            If not provided, will default to 0.
          </p>
        </div>
        <div>
          <Label htmlFor="startDate">Start Date (Optional)</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            If not provided, will default to January 1st of the current year.
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Value Tracker'}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </main>
  )
} 