import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Streak } from './streak'
import type { Streak as StreakType } from '@/types/streak'

interface CollectionProps {
  name: string
  streaks: StreakType[]
  onRecordProgress?: (streakId: string, date: string) => void
  showDetails?: boolean
}

export function Collection({
  name,
  streaks,
  onRecordProgress,
  showDetails = true
}: CollectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border rounded-lg p-4 bg-card">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <h2 className="text-2xl font-bold">{name}</h2>
        <ChevronDown className={cn("h-4 w-4 transition-transform", {
          "-rotate-180": isExpanded
        })} />
      </Button>

      {isExpanded && (
        <div className="space-y-4">
          {streaks.map((streak, index) => (
            <Streak
              key={streak.id}
              streak={streak}
              onRecordProgress={(date: string) => onRecordProgress?.(streak.id, date)}
              color={`bg-${['green', 'blue', 'purple', 'pink', 'orange', 'teal'][index % 6]}-600`}
              showDetails={showDetails}
            />
          ))}
        </div>
      )}
    </div>
  )
} 