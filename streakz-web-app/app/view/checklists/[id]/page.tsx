'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Checklist } from '@/components/checklist'
import type { ChecklistItem } from '@/types/streak'

interface ChecklistResponse {
  name: string
  items: ChecklistItem[]
}

export default function ReadOnlyChecklistView() {
  const { id } = useParams()
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await fetch(`/api/checklists/read-only?id=${id}`)
        const data = await response.json()
        setChecklist(data)
      } catch (error) {
        console.error('Failed to fetch checklist:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChecklist()
  }, [id])

  useEffect(() => {
    if (checklist?.name) {
      document.title = `${checklist.name} | Checklist View`
    }
  }, [checklist?.name])

  if (isLoading) return <div>Loading...</div>
  if (!checklist) return <div>Checklist not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{checklist.name}</h1>
      <Checklist
        id={id as string}
        name={checklist.name}
        items={checklist.items}
        showName={false}
        isReadOnly={true}
      />
    </main>
  )
} 