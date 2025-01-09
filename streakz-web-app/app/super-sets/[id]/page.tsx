'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TrackedValueSummary } from '@/components/tracked-value-summary'
import { Goal } from '@/components/goal'
import { Streak } from '@/components/streak'
import { Checklist } from '@/components/checklist'
import type { Streak as StreakType, TrackedValue, Goal as GoalType, ChecklistItem } from '@/types/streak'

interface SuperSetResponse {
  name: string
  sets: Array<{
    id: string
    type: 'streak' | 'trackedValue' | 'goal' | 'checklist'
    name: string
    items: Array<StreakType | TrackedValue | GoalType | ChecklistItem>
  }>
}

export default function SuperSetView() {
  const params = useParams()
  const [superSet, setSuperSet] = useState<SuperSetResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSuperSet = async () => {
      try {
        const response = await fetch(`/api/super-sets/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch super set')
        }

        setSuperSet(data)
      } catch (error) {
        console.error('Failed to fetch super set:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch super set')
      }
    }

    if (params.id) {
      fetchSuperSet()
    }
  }, [params.id])

  const handleCompleteChecklistItem = async (checklistId: string, itemId: string, date: string) => {
    try {
      await fetch('/api/checklist-item/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: itemId,
          date
        })
      })

      // Refresh the super set data
      const response = await fetch(`/api/super-sets/${params.id}`)
      const data = await response.json()
      setSuperSet(data)
    } catch (error) {
      console.error('Failed to complete checklist item:', error)
    }
  }

  const handleClearChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      await fetch('/api/checklist-item/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId })
      })

      // Refresh the super set data
      const response = await fetch(`/api/super-sets/${params.id}`)
      const data = await response.json()
      setSuperSet(data)
    } catch (error) {
      console.error('Failed to clear checklist item:', error)
    }
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!superSet) {
    return (
      <div className="p-4">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{superSet.name}</h1>

      {/* Set Sections */}
      <div className="space-y-12">
        {superSet.sets.map(set => (
          <section key={set.id} id={set.id} className="scroll-mt-8">
            <h2 className="text-3xl font-bold mb-6">
              <Link 
                href={`/${set.type === 'streak' ? 'collection' : 
                        set.type === 'trackedValue' ? 'tracked-values' : 
                        set.type === 'goal' ? 'goals' :
                        'checklists'}/${set.id}`}
                className="hover:text-primary"
              >
                {set.name}
              </Link>
            </h2>
            
            <div className="grid gap-4">
              {set.type === 'streak' && (
                (set.items as StreakType[]).map((streak, index) => (
                  <Link 
                    key={streak.id}
                    href={`/streak/${streak.id}`}
                    className="block hover:opacity-80"
                  >
                    <Streak
                      streak={streak}
                      color={`bg-${['green', 'blue', 'purple', 'pink', 'orange', 'teal'][index % 6]}-600`}
                      showDetails={false}
                      showBorder={true}
                    />
                  </Link>
                ))
              )}
              
              {set.type === 'trackedValue' && (
                (set.items as TrackedValue[]).map((item, index) => (
                  <Link 
                    key={item.id}
                    href={`/tracked-value/${item.id}`}
                    className="block hover:opacity-80"
                  >
                    <TrackedValueSummary
                      trackedValue={item}
                      color={`bg-${['green', 'blue', 'purple', 'pink', 'orange', 'teal'][index % 6]}-600`}
                      showDetails={false}
                    />
                  </Link>
                ))
              )}

              {set.type === 'goal' && (
                (set.items as GoalType[]).map((item, index) => (
                  <Link 
                    key={item.id}
                    href={`/goal/${item.id}`}
                    className="block hover:opacity-80"
                  >
                    <Goal
                      goal={item}
                      color={`bg-${['green', 'blue', 'purple', 'pink', 'orange', 'teal'][index % 6]}-600`}
                      showDetails={false}
                    />
                  </Link>
                ))
              )}

              {set.type === 'checklist' && (
                <Checklist
                  id={set.id}
                  name={set.name}
                  items={set.items as ChecklistItem[]}
                  onComplete={(itemId, date) => handleCompleteChecklistItem(set.id, itemId, date)}
                  onClear={(itemId) => handleClearChecklistItem(set.id, itemId)}
                  showName={false}
                  showControls={false}
                />
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
} 