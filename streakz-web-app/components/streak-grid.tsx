'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'

interface StreakGridProps {
  name: string
  contributions: Record<string, number>
  onRecordProgress?: () => void
  onDecrementProgress?: () => void
  onClearProgress?: () => void
  color?: string
  year?: number
  showPadding?: boolean
  hasBorder?: boolean
  selectedDate?: string
  onDateChange?: (date: string) => void
  currentValue?: number
}

export function StreakGrid({ 
  name, 
  contributions = {}, 
  onRecordProgress,
  onDecrementProgress,
  onClearProgress,
  year = new Date().getFullYear(),
  color = 'bg-green-600',
  showPadding = true,
  hasBorder = false,
  selectedDate,
  onDateChange,
  currentValue = 0
}: StreakGridProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate dates for the year
  const dates = Array.from({ length: 365 }, (_, i) => {
    const date = new Date(year, 0, 1)
    date.setDate(date.getDate() + i)
    if (date.getFullYear() !== year) return null
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day, 12) // Set to noon to avoid timezone issues
    return date.toLocaleDateString('en-US', {
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
      
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full px-4 sm:px-0">
          <div className="grid grid-flow-col auto-cols-min gap-[2px] mb-[2px] text-xs text-muted-foreground">
            {monthLabels.map((month, i) => (
              <div key={i} className="w-2 sm:w-3 text-start">
                {month}
              </div>
            ))}
          </div>

          <div className="grid grid-flow-col auto-cols-min gap-[2px]">
            {weeks.map((week, i) => (
              <div key={i} className="grid grid-rows-7 gap-[2px]">
                {week.map(date => (
                  <div
                    key={date}
                    className={cn(
                      "w-2 h-2 sm:w-3 sm:h-3 rounded-sm cursor-default",
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

      {onRecordProgress && (
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
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange?.(e.target.value)}
                  className="flex-1"
                />
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  Current: {currentValue}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onRecordProgress}>+1</Button>
                <Button onClick={onDecrementProgress} variant="outline">-1</Button>
                <Button onClick={onClearProgress} variant="outline">Clear</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

