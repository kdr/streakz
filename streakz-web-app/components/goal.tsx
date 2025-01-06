import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { Goal } from '@/types/streak'

interface GoalProps {
  goal: Goal
  onRecordProgress?: (date: string, value: number) => void
  color?: string
  showDetails?: boolean
}

export function Goal({ 
  goal, 
  onRecordProgress,
  color = 'bg-green-600',
  showDetails = true
}: GoalProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return format(now, 'yyyy-MM-dd')
  })
  const [value, setValue] = useState('')

  // Calculate total progress
  const totalProgress = Object.values(goal.progress).reduce((sum, val) => sum + val, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onRecordProgress && !isNaN(Number(value))) {
      onRecordProgress(date, Number(value))
      setValue('')
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{goal.name}</h2>
        {showDetails && (
          <span className="text-sm text-muted-foreground">
            Progress: {totalProgress.toFixed(2)} / {goal.targetValue}
          </span>
        )}
      </div>

      <ProgressBar
        value={totalProgress}
        max={goal.targetValue}
        color={color}
        className="mb-4"
      />

      {onRecordProgress && showDetails && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between"
          >
            Record Progress
            <ChevronDown className={cn("h-4 w-4 transition-transform", {
              "-rotate-180": isExpanded
            })} />
          </Button>
          {isExpanded && (
            <form onSubmit={handleSubmit} className="mt-2 space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter progress value..."
                  required
                />
              </div>
              <Button type="submit">Record</Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
} 