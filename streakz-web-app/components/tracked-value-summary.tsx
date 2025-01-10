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
  variant?: 'default' | 'compact'
}

export function TrackedValueSummary({ 
  trackedValue, 
  onRecordValue,
  color = 'bg-green-600',
  showDetails = true,
  variant = 'default'
}: TrackedValueSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return format(now, 'yyyy-MM-dd')
  })
  const [value, setValue] = useState('')

  // Get latest value
  const latestValue = Object.entries(trackedValue.values)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))[0]?.[1] ?? trackedValue.startValue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onRecordValue && !isNaN(Number(value))) {
      onRecordValue(date, Number(value))
      setValue('')
    }
  }

  if (variant === 'compact') {
    const isZero = Math.abs(latestValue) < 0.0001
    return (
      <div className={cn("p-3 rounded-lg flex flex-col items-center justify-center", isZero ? "bg-gray-400" : color)}>
        <h2 className="text-sm font-medium text-white/90 mb-1">{trackedValue.name}</h2>
        <span className="text-xl font-bold text-white">{Math.round(latestValue)}</span>
        <div className="flex items-center gap-2 text-white/80">
          <span className="text-xs">of</span>
          <span className="text-sm font-medium">{Math.round(trackedValue.targetValue)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-3 gap-4 items-center">
        <h2 className="text-lg font-semibold truncate">{trackedValue.name}</h2>
        <div className={cn("p-2 rounded-lg flex flex-col items-center justify-center", color)}>
          <span className="text-xl font-bold text-white">{Math.round(latestValue)}</span>
          <span className="text-xs text-white/80">Current</span>
        </div>
        <div className={cn("p-2 rounded-lg flex flex-col items-center justify-center", color)}>
          <span className="text-xl font-bold text-white">{Math.round(trackedValue.targetValue)}</span>
          <span className="text-xs text-white/80">Target</span>
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