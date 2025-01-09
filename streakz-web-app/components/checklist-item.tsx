'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ChevronDown, CheckCircle2, XCircle } from 'lucide-react'
import type { ChecklistItem as ChecklistItemType } from '@/types/streak'

interface ChecklistItemProps {
  item: ChecklistItemType
  onComplete?: (date: string) => void
  onClear?: () => void
  showLink?: boolean
  showControls?: boolean
}

export function ChecklistItem({ 
  item, 
  onComplete, 
  onClear, 
  showLink = true,
  showControls = true 
}: ChecklistItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [date, setDate] = useState(() => {
    const now = new Date()
    return format(now, 'yyyy-MM-dd')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onComplete) {
      onComplete(date)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {item.completedDate ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-gray-400" />
        )}
        <div className="flex flex-col">
          {showLink ? (
            <Link 
              href={`/checklist-items/${item.id}`}
              className="font-medium hover:underline"
            >
              {item.name}
            </Link>
          ) : (
            <span className="font-medium">{item.name}</span>
          )}
          {item.completedDate && (
            <span className="text-sm text-gray-500">
              Completed on {format(new Date(item.completedDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
      
      {showControls && (onComplete || onClear) && (
        <div className="flex items-center gap-2">
          {!item.completedDate && onComplete ? (
            <div>
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between"
              >
                Record Completion
                <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", {
                  "-rotate-180": isExpanded
                })} />
              </Button>
              {isExpanded && (
                <form onSubmit={handleSubmit} className="absolute mt-2 p-4 bg-background border rounded-lg shadow-lg">
                  <div className="space-y-4">
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
                    <Button type="submit">Complete</Button>
                  </div>
                </form>
              )}
            </div>
          ) : item.completedDate && onClear ? (
            <Button variant="outline" onClick={onClear}>Clear</Button>
          ) : null}
        </div>
      )}
    </div>
  )
} 