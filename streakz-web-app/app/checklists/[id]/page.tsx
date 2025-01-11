'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checklist } from '@/components/checklist'
import { db } from '@/lib/db'
import type { ChecklistItem } from '@/types/streak'
import { Button } from '@/components/ui/button'

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

  const handleShare = async () => {
    try {
      const response = await fetch('/api/read-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: params.id,
          type: 'checklist'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create read-only view')
      }

      const { id: readOnlyId } = await response.json()
      window.location.href = `/view/checklists/${readOnlyId}`
    } catch (error) {
      console.error('Failed to create read-only view:', error)
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
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">{name}</h1>
        <Button variant="outline" onClick={handleShare}>
          Share as Read-only
        </Button>
      </div>
      {items && (
        <Checklist
          id={params.id}
          name={name}
          items={items}
          onComplete={handleComplete}
          onClear={handleClear}
        />
      )}
    </main>
  )
} 