'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { db } from '@/lib/db'

export default function NewChecklist() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [checklistItemIds, setChecklistItemIds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Split the IDs by newline and filter out empty lines
      const itemIds = checklistItemIds
        .split('\n')
        .map(id => id.trim())
        .filter(Boolean)

      const id = await db.createChecklist(name, itemIds)
      router.push(`/checklists/${id}`)
    } catch (error) {
      console.error('Failed to create checklist:', error)
      setError(error instanceof Error ? error.message : 'Failed to create checklist')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create a Checklist</h1>
      <p className="text-lg mb-8">
        Group related checklist items together to track multiple tasks in one place.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Checklist Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Moving House Tasks"
            required
          />
        </div>
        <div>
          <Label htmlFor="checklistItemIds">Checklist Item IDs (one per line)</Label>
          <Textarea
            id="checklistItemIds"
            value={checklistItemIds}
            onChange={(e) => setChecklistItemIds(e.target.value)}
            placeholder="Enter checklist item IDs, one per line..."
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Enter each checklist item ID on a new line. You can find the ID in the URL when viewing a checklist item.
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Checklist'}
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