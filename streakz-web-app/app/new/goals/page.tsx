'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewGoalSet() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [goalIds, setGoalIds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Clean and validate goal IDs
    const cleanedIds = goalIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    if (cleanedIds.length === 0) {
      setError('Please enter at least one goal ID')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          goalIds: cleanedIds
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create goal set')
      }

      if (!data.id) {
        throw new Error('No goal set ID received')
      }

      router.push(`/goals/${data.id}`)
    } catch (error) {
      console.error('Failed to create goal set:', error)
      setError(error instanceof Error ? error.message : 'Failed to create goal set')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create an Accumulative Goal Set</h1>
      <p className="text-lg mb-8">
        Group related accumulative goals together to track and visualize their progress in one place.
        Perfect for organizing multiple goals with similar themes, like fitness targets or learning objectives.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Set Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 2024 Fitness Goals"
            required
          />
        </div>
        <div>
          <Label htmlFor="goalIds">Goal IDs (one per line)</Label>
          <Textarea
            id="goalIds"
            value={goalIds}
            onChange={(e) => setGoalIds(e.target.value)}
            placeholder="Enter goal IDs, one per line..."
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Enter each accumulative goal ID on a new line. You can find the ID in the URL when viewing a goal.
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Goal Set'}
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