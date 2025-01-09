'use client'

import Link from 'next/link'
import { ChecklistItem } from '@/components/checklist-item'
import type { ChecklistItem as ChecklistItemType } from '@/types/streak'

interface ChecklistProps {
  id: string
  name: string
  items: ChecklistItemType[]
  onComplete?: (itemId: string, date: string) => void
  onClear?: (itemId: string) => void
  showLink?: boolean
  showName?: boolean
  showControls?: boolean
}

export function Checklist({ 
  id, 
  name, 
  items, 
  onComplete, 
  onClear, 
  showLink = true,
  showName = true,
  showControls = true
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
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onComplete={showControls && onComplete ? (date) => onComplete(item.id, date) : undefined}
            onClear={showControls && onClear ? () => onClear(item.id) : undefined}
            showLink={showLink}
            showControls={showControls}
          />
        ))}
      </div>
    </div>
  )
} 