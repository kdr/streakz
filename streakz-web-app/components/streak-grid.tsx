'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakGridProps {
  name: string
  contributions: Record<string, number>
  onRecordToday?: () => void
  year?: number
}

export function StreakGrid({ name, contributions = {}, onRecordToday, year = new Date().getFullYear() }: StreakGridProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate dates for the year
  const dates = Array.from({ length: 365 }, (_, i) => {
    const date = new Date(year, 0, i + 1)
    return date.toISOString().split('T')[0]
  })

  // Ensure contributions is an object
  const safeContributions = contributions || {}

  // Group dates by week
  const weeks = dates.reduce((acc, date, i) => {
    const weekIndex = Math.floor(i / 7)
    if (!acc[weekIndex]) acc[weekIndex] = []
    acc[weekIndex].push(date)
    return acc
  }, [] as string[][])

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h2 className="text-2xl font-bold mb-4">{name}</h2>
      <div className="overflow-x-auto">
        <div className="inline-grid grid-flow-col gap-1">
          {weeks.map((week, i) => (
            <div key={i} className="grid grid-rows-7 gap-1">
              {week.map(date => (
                <div
                  key={date}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    safeContributions[date] ? "bg-primary" : "bg-muted"
                  )}
                  title={`${date}: ${safeContributions[date] || 0} contributions`}
                />
              ))}
            </div>
          ))}
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

