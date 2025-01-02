'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewCollection() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [streakIds, setStreakIds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Clean and validate streak IDs
    const cleanedIds = streakIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    if (cleanedIds.length === 0) {
      setError('Please enter at least one streak ID')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          streakIds: cleanedIds
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create collection')
      }

      if (!data.id) {
        throw new Error('No collection ID received')
      }

      router.push(`/collection/${data.id}`)
    } catch (error) {
      console.error('Failed to create collection:', error)
      setError(error instanceof Error ? error.message : 'Failed to create collection')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Create a Streak Collection</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Collection Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fitness Goals"
            required
          />
        </div>
        <div>
          <Label htmlFor="streakIds">Streak IDs (one per line)</Label>
          <Textarea
            id="streakIds"
            value={streakIds}
            onChange={(e) => setStreakIds(e.target.value)}
            placeholder="Enter streak IDs, one per line..."
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Enter each streak ID on a new line. You can find the ID in the URL when viewing a streak.
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Collection'}
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

