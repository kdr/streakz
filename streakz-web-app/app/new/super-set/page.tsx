'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function NewSuperSet() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [setEntries, setSetEntries] = useState<Array<{ id: string; type: 'streak' | 'trackedValue' | 'goal' | 'checklist' }>>([])
  const [newId, setNewId] = useState('')
  const [newType, setNewType] = useState<'streak' | 'trackedValue' | 'goal' | 'checklist'>('streak')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddSet = () => {
    if (!newId.trim()) return
    setSetEntries([...setEntries, { id: newId.trim(), type: newType }])
    setNewId('')
  }

  const handleRemoveSet = (index: number) => {
    setSetEntries(setEntries.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (setEntries.length === 0) {
      setError('Please add at least one set')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/super-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          setIds: setEntries
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create super set')
      }

      if (!data.id) {
        throw new Error('No super set ID received')
      }

      router.push(`/super-sets/${data.id}`)
    } catch (error) {
      console.error('Failed to create super set:', error)
      setError(error instanceof Error ? error.message : 'Failed to create super set')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create a Super Set</h1>
      <p className="text-lg mb-8">
        Group different types of sets together to monitor and visualize multiple collections in one place.
        You can combine streak collections, value tracker sets, goal sets, and checklists.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Set Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fitness & Health Dashboard"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Add Sets</Label>
          <div className="flex gap-2">
            <Select value={newType} onValueChange={(value: 'streak' | 'trackedValue' | 'goal' | 'checklist') => setNewType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="streak">Streak Collection</SelectItem>
                <SelectItem value="trackedValue">Value Tracker Set</SelectItem>
                <SelectItem value="goal">Goal Set</SelectItem>
                <SelectItem value="checklist">Checklist</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="Enter set ID..."
            />
            <Button type="button" onClick={handleAddSet}>Add</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the ID of each set you want to include. You can find the ID in the URL when viewing a set.
          </p>
        </div>
        {setEntries.length > 0 && (
          <div className="border rounded-lg p-4 space-y-2">
            <Label>Added Sets</Label>
            {setEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded">
                <div>
                  <span className="font-mono text-sm">{entry.id}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({entry.type === 'streak' ? 'Streak Collection' :
                       entry.type === 'trackedValue' ? 'Value Tracker Set' :
                       entry.type === 'goal' ? 'Goal Set' :
                       'Checklist'})
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSet(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Super Set'}
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