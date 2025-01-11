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
  onRecordProgress?: (date: string, progress: number) => void
  color?: string
  showDetails?: boolean
  variant?: 'default' | 'compact'
  showProgressBar?: boolean
  isReadOnly?: boolean
  minimizeText?: boolean
}

export function Goal({
  goal,
  onRecordProgress,
  color = 'bg-green-600',
  showDetails = true,
  variant = 'default',
  showProgressBar = true,
  isReadOnly = false,
  minimizeText = false
}: GoalProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return format(now, 'yyyy-MM-dd')
  })
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onRecordProgress && value) {
      onRecordProgress(date, parseFloat(value))
      setValue('')
    }
  }

  const totalProgress = Object.values(goal.progress).reduce((sum, val) => sum + val, 0)
  const progressPercentage = (totalProgress / goal.targetValue) * 100

  return (
    <div className={cn(
      "bg-card p-6 border rounded-lg",
      variant === 'compact' && "p-4",
      !showProgressBar && color
    )}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={cn(
            "font-bold",
            variant === 'compact' ? "text-lg" : "text-2xl"
          )}>{goal.name}</h2>
          <span className="text-sm text-muted-foreground">
            {minimizeText ? (
              `${totalProgress.toFixed(1)} / ${goal.targetValue.toFixed(1)}`
            ) : (
              `Progress: ${totalProgress.toFixed(1)} / Total: ${goal.targetValue.toFixed(1)}`
            )}
          </span>
        </div>
      </div>

      {showProgressBar && (
        <ProgressBar
          value={progressPercentage}
          max={100}
          color={color}
          className="mb-4"
        />
      )}

      {!isReadOnly && onRecordProgress && showDetails && (
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