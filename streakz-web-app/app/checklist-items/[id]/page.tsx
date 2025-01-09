'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChecklistItem } from '@/components/checklist-item'
import { db } from '@/lib/db'
import type { ChecklistItem as ChecklistItemType } from '@/types/streak'

interface PageProps {
  params: {
    id: string
  }
}

export default function ChecklistItemPage({ params }: PageProps) {
  const router = useRouter()
  const [item, setItem] = useState<ChecklistItemType>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadItem = async () => {
      try {
        const itemData = await db.getChecklistItem(params.id)
        if (!itemData) {
          router.push('/')
          return
        }
        setItem(itemData)
      } catch (error) {
        console.error('Failed to load checklist item:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItem()
  }, [params.id, router])

  const handleComplete = async (date: string) => {
    if (!item) return

    try {
      await db.completeChecklistItem(item.id, date)
      setItem({ ...item, completedDate: date })
    } catch (error) {
      console.error('Failed to complete checklist item:', error)
    }
  }

  const handleClear = async () => {
    if (!item) return

    try {
      await db.clearChecklistItem(item.id)
      setItem({ ...item, completedDate: undefined })
    } catch (error) {
      console.error('Failed to clear checklist item:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="container max-w-2xl py-8">
      <ChecklistItem
        item={item}
        onComplete={handleComplete}
        onClear={handleClear}
        showLink={false}
      />
    </div>
  )
} 