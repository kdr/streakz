'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface StreakGridProps {
  name: string
  contributions: Record<string, number>
  onRecordToday?: () => void
  year?: number
  color?: string
}

export function StreakGrid({ name, contributions = {}, onRecordToday, year = new Date().getFullYear(), color = 'bg-green-600' }: StreakGridProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate dates for the year
  const dates = Array.from({ length: 53 * 7 }, (_, i) => {
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

  // Get total contributions for the year
  const totalContributions = Object.values(safeContributions).reduce((sum, count) => sum + count, 0)

  // Find the first week of each month
  const monthLabels = weeks.map(week => {
    const firstDateOfWeek = week[0]
    const date = new Date(firstDateOfWeek)
    const isFirstWeekOfMonth = date.getDate() <= 7
    return isFirstWeekOfMonth ? format(date, 'MMM') : null
  })

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{name}</h2>
        <span className="text-sm text-muted-foreground">
          {totalContributions} in {year}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <div>
          {/* Month labels */}
          <div className="grid grid-flow-col gap-1 mb-1 text-xs text-muted-foreground">
            {monthLabels.map((month, i) => (
              <div key={i} className="w-3 text-start">
                {month}
              </div>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="inline-grid grid-flow-col gap-1">
            {weeks.map((week, i) => (
              <div key={i} className="grid grid-rows-7 gap-1">
                {week.map(date => (
                  <div
                    key={date}
                    className={cn(
                      "w-3 h-3 rounded-sm",
                      safeContributions[date] ? color : "bg-muted"
                    )}
                    title={`${date}: ${safeContributions[date] || 0} contributions`}
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
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between"
          >
            Record Progress
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {isExpanded && (
            <div className="mt-2">
              <Button onClick={onRecordToday} className="w-full">
                Record Today
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

