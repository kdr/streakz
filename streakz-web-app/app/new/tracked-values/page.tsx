'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X } from 'lucide-react'
import { format, startOfYear } from 'date-fns'

interface NewTrackedValue {
  name: string
  targetValue: number
  startValue?: number
  startDate?: string
  id?: string
}

export default function NewTrackedValueSet() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [trackedValueIds, setTrackedValueIds] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newTrackedValues, setNewTrackedValues] = useState<NewTrackedValue[]>([])
  
  // Form state for new tracked value
  const [newTrackerName, setNewTrackerName] = useState('')
  const [newTargetValue, setNewTargetValue] = useState('')
  const [newStartValue, setNewStartValue] = useState('')
  const [newStartDate, setNewStartDate] = useState(() => format(startOfYear(new Date()), 'yyyy-MM-dd'))

  const handleAddNewTracker = async () => {
    if (!newTrackerName.trim() || !newTargetValue) return
    
    try {
      const response = await fetch('/api/tracked-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newTrackerName,
          targetValue: Number(newTargetValue),
          ...(newStartValue && { startValue: Number(newStartValue) }),
          ...(newStartDate && { startDate: newStartDate })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create value tracker')
      }

      if (!data.id) {
        throw new Error('No value tracker ID received')
      }

      setNewTrackedValues([...newTrackedValues, {
        name: newTrackerName,
        targetValue: Number(newTargetValue),
        startValue: newStartValue ? Number(newStartValue) : undefined,
        startDate: newStartDate,
        id: data.id
      }])
      
      // Reset form
      setNewTrackerName('')
      setNewTargetValue('')
      setNewStartValue('')
      setNewStartDate(format(startOfYear(new Date()), 'yyyy-MM-dd'))
    } catch (error) {
      console.error('Failed to create value tracker:', error)
      setError(error instanceof Error ? error.message : 'Failed to create value tracker')
    }
  }

  const handleRemoveNewTracker = (index: number) => {
    setNewTrackedValues(newTrackedValues.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Clean and validate tracked value IDs from textarea
    const existingIds = trackedValueIds
      .split('\n')
      .map(id => id.trim())
      .filter(Boolean)

    // Combine existing IDs with newly created tracker IDs
    const allTrackerIds = [...existingIds, ...newTrackedValues.map(tracker => tracker.id!)]

    if (allTrackerIds.length === 0) {
      setError('Please enter at least one value tracker ID or create a new tracker')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/tracked-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          trackedValueIds: allTrackerIds
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

        <div className="space-y-4">
          <div>
            <Label>Create New Value Trackers</Label>
            <div className="space-y-2">
              <Input
                value={newTrackerName}
                onChange={(e) => setNewTrackerName(e.target.value)}
                placeholder="Enter tracker name..."
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    step="any"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(e.target.value)}
                    placeholder="Target value..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Target value to reach</p>
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    value={newStartValue}
                    onChange={(e) => setNewStartValue(e.target.value)}
                    placeholder="Starting value (optional)..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Starting value (optional)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Start date (optional)</p>
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddNewTracker}
                  disabled={!newTrackerName.trim() || !newTargetValue}
                  className="mt-5"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {newTrackedValues.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <Label>New Value Trackers to Add</Label>
              {newTrackedValues.map((tracker, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">{tracker.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Target: {tracker.targetValue}
                      {tracker.startValue !== undefined && `, Start: ${tracker.startValue}`}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNewTracker(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="trackedValueIds">Or Add Existing Value Tracker IDs (one per line)</Label>
          <Textarea
            id="trackedValueIds"
            value={trackedValueIds}
            onChange={(e) => setTrackedValueIds(e.target.value)}
            placeholder="Enter value tracker IDs, one per line..."
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