'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewGoal() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          targetValue: Number(targetValue)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create goal')
      }

      if (!data.id) {
        throw new Error('No goal ID received')
      }

      router.push(`/goal/${data.id}`)
    } catch (error) {
      console.error('Failed to create goal:', error)
      setError(error instanceof Error ? error.message : 'Failed to create goal')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create an Accumulative Goal</h1>
      <p className="text-lg mb-8">
        Track progress towards a numeric target by accumulating values over time. Perfect for tracking miles run,
        pages read, hours practiced, or any other measurable goal where progress adds up.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name your goal</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Run 500 Miles in 2024"
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
            placeholder="e.g., 500"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            The total value you want to reach. Your progress will accumulate towards this target.
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Goal'}
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