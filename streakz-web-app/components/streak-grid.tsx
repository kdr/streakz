'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface StreakGridProps {
  name: string
  contributions: Record<string, number>
  onRecordToday?: () => void
  onDecrementToday?: () => void
  onClearToday?: () => void
  color?: string
  year?: number
  showPadding?: boolean
  hasBorder?: boolean
}

export function StreakGrid({ 
  name, 
  contributions = {}, 
  onRecordToday,
  onDecrementToday,
  onClearToday,
  year = new Date().getFullYear(),
  color = 'bg-green-600',
  showPadding = true,
  hasBorder = false
}: StreakGridProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate dates for the year
  const dates = Array.from({ length: 365 }, (_, i) => {
    const date = new Date(year, 0, 1)
    date.setDate(date.getDate() + i)
    if (date.getFullYear() !== year) return null
    return date.toISOString().split('T')[0]
  }).filter(Boolean) as string[]

  // Ensure contributions is an object
  const safeContributions = contributions || {}

  // Group dates by week
  const weeks = dates.reduce((acc, date, i) => {
    const weekIndex = Math.floor(i / 7)
    if (!acc[weekIndex]) acc[weekIndex] = []
    acc[weekIndex].push(date)
    return acc
  }, [] as string[][])

  // Get total contributions and days for the year
  const totalContributions = Object.values(safeContributions).reduce((sum, count) => sum + count, 0)
  const totalDays = Object.values(safeContributions).filter(value => value > 0).length

  // Find the first week of each month
  const monthLabels = weeks.map(week => {
    const firstDateOfWeek = week[0]
    const date = new Date(firstDateOfWeek)
    const isFirstWeekOfMonth = date.getDate() <= 7
    return isFirstWeekOfMonth ? format(date, 'MMM') : null
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={cn(
      "bg-card",
      hasBorder && "border rounded-lg",
      showPadding && "p-6"
    )}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{name}</h2>
        <span className="text-sm text-muted-foreground">
          {totalDays} days, {totalContributions} Total
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-flow-col gap-1 mb-1 text-xs text-muted-foreground">
            {monthLabels.map((month, i) => (
              <div key={i} className="w-3 text-start">
                {month}
              </div>
            ))}
          </div>

          <div className="inline-grid grid-flow-col gap-1">
            {weeks.map((week, i) => (
              <div key={i} className="grid grid-rows-7 gap-1">
                {week.map(date => (
                  <div
                    key={date}
                    className={cn(
                      "w-3 h-3 rounded-sm cursor-default",
                      safeContributions[date] ? color : "bg-muted"
                    )}
                    title={`${formatDate(date)}: ${safeContributions[date] || 0} recorded`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {onRecordToday && (
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
            <div className="mt-2 flex gap-2">
              <Button onClick={onRecordToday}>+1</Button>
              <Button onClick={onDecrementToday} variant="outline">-1</Button>
              <Button onClick={onClearToday} variant="outline">Clear Today</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

