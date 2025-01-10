'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X } from 'lucide-react'
import { db } from '@/lib/db'

interface NewGoal {
  name: string
  targetValue: number
  id?: string
}

export default function NewGoalSet() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [goalIds, setGoalIds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newGoals, setNewGoals] = useState<NewGoal[]>([])
  
  // Form state for new goal
  const [newGoalName, setNewGoalName] = useState('')
  const [newTargetValue, setNewTargetValue] = useState('')

  const handleAddNewGoal = async () => {
    if (!newGoalName.trim() || !newTargetValue) return
    
    try {
      const id = await db.createGoal(newGoalName, Number(newTargetValue))
      
      setNewGoals([...newGoals, {
        name: newGoalName,
        targetValue: Number(newTargetValue),
        id
      }])
      
      // Reset form
      setNewGoalName('')
      setNewTargetValue('')
    } catch (error) {
      console.error('Failed to create goal:', error)
      setError(error instanceof Error ? error.message : 'Failed to create goal')
    }
  }

  const handleRemoveNewGoal = (index: number) => {
    setNewGoals(newGoals.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Clean and validate goal IDs from textarea
    const existingIds = goalIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    // Combine existing IDs with newly created goal IDs
    const allGoalIds = [...existingIds, ...newGoals.map(goal => goal.id!)]

    if (allGoalIds.length === 0) {
      setError('Please enter at least one goal ID or create a new goal')
      setIsLoading(false)
      return
    }

    try {
      const id = await db.createGoalSet(name, allGoalIds)
      router.push(`/goals/${id}`)
    } catch (error) {
      console.error('Failed to create goal set:', error)
      setError(error instanceof Error ? error.message : 'Failed to create goal set')
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Create a Count Goal Set</h1>
      <p className="text-lg mb-8">
        Group related count goals together to track and visualize their progress in one place.
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

        <div className="space-y-4">
          <div>
            <Label>Create New Count Goals</Label>
            <div className="space-y-2">
              <Input
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="Enter goal name..."
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    step="any"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(e.target.value)}
                    placeholder="Target value..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Target value to reach</p>
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddNewGoal}
                  disabled={!newGoalName.trim() || !newTargetValue}
                  className="mt-5"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {newGoals.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <Label>New Count Goals to Add</Label>
              {newGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">{goal.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Target: {goal.targetValue}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNewGoal(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="goalIds">Or Add Existing Count Goal IDs (one per line)</Label>
          <Textarea
            id="goalIds"
            value={goalIds}
            onChange={(e) => setGoalIds(e.target.value)}
            placeholder="Enter goal IDs, one per line..."
          />
          <p className="text-sm text-muted-foreground mt-1">
            Enter each count goal ID on a new line. You can find the ID in the URL when viewing a goal.
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