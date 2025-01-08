import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { TrackedValue } from '@/types/streak'

interface TrackedValueSummaryProps {
  trackedValue: TrackedValue
  onRecordValue?: (date: string, value: number) => void
  color?: string
  showDetails?: boolean
}

export function TrackedValueSummary({ 
  trackedValue, 
  onRecordValue,
  color = 'bg-green-600',
  showDetails = true
}: TrackedValueSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return format(now, 'yyyy-MM-dd')
  })
  const [value, setValue] = useState('')

  // Get latest value and calculate min/max
  const values = Object.values(trackedValue.values)
  const latestValue = Object.entries(trackedValue.values)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))[0]?.[1] ?? trackedValue.startValue
  const minValue = Math.min(...values, trackedValue.startValue)
  const maxValue = Math.max(...values, trackedValue.startValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onRecordValue && !isNaN(Number(value))) {
      onRecordValue(date, Number(value))
      setValue('')
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{trackedValue.name}</h2>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className={cn("p-4 rounded-lg flex flex-col items-center justify-center", color)}>
          <span className="text-3xl font-bold text-white">{latestValue.toFixed(2)}</span>
          <span className="text-sm text-white/80">Latest Value</span>
        </div>
        <div className={cn("p-4 rounded-lg flex flex-col items-center justify-center", color)}>
          <span className="text-3xl font-bold text-white">{trackedValue.targetValue.toFixed(2)}</span>
          <span className="text-sm text-white/80">Target Value</span>
        </div>
        <div className="p-4 rounded-lg flex flex-col items-center justify-center bg-muted">
          <span className="text-3xl font-bold">{minValue.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">Min Value</span>
        </div>
        <div className="p-4 rounded-lg flex flex-col items-center justify-center bg-muted">
          <span className="text-3xl font-bold">{maxValue.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">Max Value</span>
        </div>
      </div>

      {onRecordValue && showDetails && (
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
                  placeholder="Enter current value..."
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