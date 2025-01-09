'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checklist } from '@/components/checklist'
import { db } from '@/lib/db'
import type { ChecklistItem } from '@/types/streak'

interface PageProps {
  params: {
    id: string
  }
}

export default function ChecklistPage({ params }: PageProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChecklist = async () => {
      try {
        const checklist = await db.getChecklist(params.id)
        if (!checklist) {
          router.push('/')
          return
        }
        setName(checklist.name)
        setItems(checklist.checklistItems)
      } catch (error) {
        console.error('Failed to load checklist:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChecklist()
  }, [params.id, router])

  const handleComplete = async (itemId: string, date: string) => {
    try {
      await db.completeChecklistItem(itemId, date)
      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, completedDate: date }
          : item
      ))
    } catch (error) {
      console.error('Failed to complete checklist item:', error)
    }
  }

  const handleClear = async (itemId: string) => {
    try {
      await db.clearChecklistItem(itemId)
      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, completedDate: undefined }
          : item
      ))
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

  return (
    <div className="container max-w-2xl py-8">
      <Checklist
        id={params.id}
        name={name}
        items={items}
        onComplete={handleComplete}
        onClear={handleClear}
        showLink={false}
      />
    </div>
  )
} 