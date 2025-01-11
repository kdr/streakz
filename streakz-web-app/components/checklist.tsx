'use client'

import Link from 'next/link'
import type { ChecklistItem as ChecklistItemType } from '@/types/streak'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChecklistProps {
  id: string
  name: string
  items: ChecklistItemType[]
  onComplete?: (itemId: string, date: string) => void
  onClear?: (itemId: string) => void
  showLink?: boolean
  showName?: boolean
  showControls?: boolean
  isReadOnly?: boolean
}

export function Checklist({ 
  id, 
  name, 
  items, 
  onComplete, 
  onClear, 
  showLink = true,
  showName = true,
  showControls = true,
  isReadOnly = false
}: ChecklistProps) {
  return (
    <div className="space-y-4">
      {showName && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {showLink ? (
              <Link
                href={`/checklists/${id}`}
                className="hover:underline"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </h2>
        </div>
      )}

      <div className="space-y-2">
        {items?.map((item) => {
          const isCompleted = !!item.completedDate
          const latestCompletion = item.completedDate

          return (
            <div 
              key={item.id} 
              className={cn(
                "flex items-center justify-between p-4 border rounded-lg",
                isCompleted ? "bg-emerald-100 text-emerald-950" : "bg-gray-100 text-gray-950"
              )}
            >
              <div>
                <div className="font-medium">{item.name}</div>
                {isCompleted && latestCompletion && (
                  <div className={cn(
                    "text-sm",
                    isCompleted ? "text-emerald-700" : "text-muted-foreground"
                  )}>
                    Last completed: {format(parseISO(latestCompletion), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
              {!isReadOnly && showControls && (
                <div className="flex gap-2">
                  {isCompleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onClear?.(item.id)}
                      className="bg-white hover:bg-white/90"
                    >
                      Clear
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onComplete?.(item.id, new Date().toISOString())}
                      className="bg-white hover:bg-white/90"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 