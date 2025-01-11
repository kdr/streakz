import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { TrackedValue } from '@/types/streak'

interface TrackedValueSummaryProps {
  trackedValue: TrackedValue
  onRecordValue?: (date: string, value: number) => void
  color?: string
  showDetails?: boolean
  variant?: 'default' | 'compact'
  showProgressBar?: boolean
  isReadOnly?: boolean
  className?: string
  minimizeText?: boolean
}

export function TrackedValueSummary({
  trackedValue,
  onRecordValue,
  color = 'bg-green-600',
  showDetails = true,
  variant = 'default',
  showProgressBar = true,
  isReadOnly = false,
  className,
  minimizeText = false
}: TrackedValueSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return format(now, 'yyyy-MM-dd')
  })
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onRecordValue && value) {
      onRecordValue(date, parseFloat(value))
      setValue('')
    }
  }

  const latestValue = Object.entries(trackedValue.values)
    .sort(([a], [b]) => b.localeCompare(a))[0]?.[1] ?? trackedValue.startValue

  const progressPercentage = ((latestValue - trackedValue.startValue) / (trackedValue.targetValue - trackedValue.startValue)) * 100

  return (
    <div className={cn(
      "bg-card p-6 border rounded-lg",
      variant === 'compact' && "p-4",
      !showProgressBar && color,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={cn(
            "font-bold",
            variant === 'compact' ? "text-lg" : "text-2xl"
          )}>{trackedValue.name}</h2>
          <span className="text-sm text-muted-foreground">
            {minimizeText ? (
              `${latestValue.toFixed(1)} / ${trackedValue.targetValue.toFixed(1)}`
            ) : (
              `Current: ${latestValue.toFixed(2)} / Target: ${trackedValue.targetValue.toFixed(2)}`
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

      {!isReadOnly && onRecordValue && showDetails && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between"
          >
            Record Value
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