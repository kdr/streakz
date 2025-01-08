import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { StreakGrid } from './streak-grid'
import type { Streak as StreakType } from '@/types/streak'

interface StreakProps {
  streak: StreakType
  onRecordProgress?: (date: string) => void
  color?: string
  showDetails?: boolean
  showBorder?: boolean
}

export function Streak({ 
  streak, 
  onRecordProgress,
  color = 'bg-green-600',
  showDetails = true,
  showBorder = true
}: StreakProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return format(now, 'yyyy-MM-dd')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onRecordProgress) {
      onRecordProgress(date)
    }
  }

  return (
    <div className={cn("bg-card p-6", showBorder && "border rounded-lg")}>
      <StreakGrid
        name={streak.name}
        contributions={streak.contributions}
        color={color}
        showPadding={false}
        hasBorder={false}
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
              <Button type="submit">Record</Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
} 