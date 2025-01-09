'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { db } from '@/lib/db'

export default function NewChecklistItem() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const id = await db.createChecklistItem(name)
      router.push(`/checklist-items/${id}`)
    } catch (error) {
      console.error('Failed to create checklist item:', error)
      setError(error instanceof Error ? error.message : 'Failed to create checklist item')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create a Checklist Item</h1>
      <p className="text-lg mb-8">
        Create a new checklist item that you can mark as complete when accomplished.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name your checklist item</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Complete tax return"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Checklist Item'}
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