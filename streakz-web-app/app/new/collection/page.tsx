'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X } from 'lucide-react'

interface NewStreak {
  name: string
  id?: string
}

export default function NewCollection() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [streakIds, setStreakIds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newStreaks, setNewStreaks] = useState<NewStreak[]>([])
  const [newStreakName, setNewStreakName] = useState('')

  const handleAddNewStreak = async () => {
    if (!newStreakName.trim()) return
    
    try {
      const response = await fetch('/api/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStreakName })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create streak')
      }

      if (!data.id) {
        throw new Error('No streak ID received')
      }

      setNewStreaks([...newStreaks, { name: newStreakName, id: data.id }])
      setNewStreakName('')
    } catch (error) {
      console.error('Failed to create streak:', error)
      setError(error instanceof Error ? error.message : 'Failed to create streak')
    }
  }

  const handleRemoveNewStreak = (index: number) => {
    setNewStreaks(newStreaks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Clean and validate streak IDs from textarea
    const existingIds = streakIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    // Combine existing IDs with newly created streak IDs
    const allStreakIds = [...existingIds, ...newStreaks.map(streak => streak.id!)]

    if (allStreakIds.length === 0) {
      setError('Please enter at least one streak ID or create a new streak')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          streakIds: allStreakIds
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

        <div className="space-y-4">
          <div>
            <Label>Create New Streaks</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newStreakName}
                onChange={(e) => setNewStreakName(e.target.value)}
                placeholder="Enter streak name..."
              />
              <Button 
                type="button" 
                onClick={handleAddNewStreak}
                disabled={!newStreakName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {newStreaks.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <Label>New Streaks to Add</Label>
              {newStreaks.map((streak, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded">
                  <span>{streak.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNewStreak(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="streakIds">Or Add Existing Streak IDs (one per line)</Label>
          <Textarea
            id="streakIds"
            value={streakIds}
            onChange={(e) => setStreakIds(e.target.value)}
            placeholder="Enter streak IDs, one per line..."
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

