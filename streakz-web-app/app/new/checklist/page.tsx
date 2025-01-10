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
  const [newItemName, setNewItemName] = useState('')
  const [newItems, setNewItems] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddNewItem = async () => {
    if (!newItemName.trim()) return

    try {
      const id = await db.createChecklistItem(newItemName)
      setNewItems([...newItems, { id, name: newItemName }])
      setNewItemName('')
    } catch (error) {
      console.error('Failed to create checklist item:', error)
      setError(error instanceof Error ? error.message : 'Failed to create checklist item')
    }
  }

  const handleRemoveNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Clean and validate checklist item IDs from textarea
    const existingIds = checklistItemIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    // Combine existing IDs with newly created checklist item IDs
    const allItemIds = [...existingIds, ...newItems.map(item => item.id)]

    if (allItemIds.length === 0) {
      setError('Please enter at least one checklist item ID or create a new item')
      setIsLoading(false)
      return
    }

    try {
      const id = await db.createChecklist(name, allItemIds)
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

        {/* Inline checklist item creation */}
        <div className="space-y-2">
          <Label>Create New Checklist Item</Label>
          <div className="flex gap-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter new checklist item name..."
            />
            <Button type="button" onClick={handleAddNewItem}>Add</Button>
          </div>
        </div>

        {/* Display newly created items */}
        {newItems.length > 0 && (
          <div className="border rounded-lg p-4 space-y-2">
            <Label>Newly Created Items</Label>
            {newItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded">
                <span>{item.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveNewItem(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <div>
          <Label htmlFor="checklistItemIds">Checklist Item IDs (one per line)</Label>
          <Textarea
            id="checklistItemIds"
            value={checklistItemIds}
            onChange={(e) => setChecklistItemIds(e.target.value)}
            placeholder="Enter checklist item IDs, one per line..."
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