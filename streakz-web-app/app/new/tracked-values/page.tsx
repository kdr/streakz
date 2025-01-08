'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewTrackedValueSet() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [trackedValueIds, setTrackedValueIds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Clean and validate tracked value IDs
    const cleanedIds = trackedValueIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    if (cleanedIds.length === 0) {
      setError('Please enter at least one value tracker ID')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/tracked-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          trackedValueIds: cleanedIds
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create value tracker set')
      }

      if (!data.id) {
        throw new Error('No value tracker set ID received')
      }

      router.push(`/tracked-values/${data.id}`)
    } catch (error) {
      console.error('Failed to create value tracker set:', error)
      setError(error instanceof Error ? error.message : 'Failed to create value tracker set')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create a Value Tracker Set</h1>
      <p className="text-lg mb-8">
        Group related value trackers together to monitor and visualize multiple metrics in one place.
        Perfect for tracking related values like different fitness metrics or financial indicators.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Set Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fitness Metrics"
            required
          />
        </div>
        <div>
          <Label htmlFor="trackedValueIds">Value Tracker IDs (one per line)</Label>
          <Textarea
            id="trackedValueIds"
            value={trackedValueIds}
            onChange={(e) => setTrackedValueIds(e.target.value)}
            placeholder="Enter value tracker IDs, one per line..."
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Enter each value tracker ID on a new line. You can find the ID in the URL when viewing a value tracker.
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Value Tracker Set'}
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