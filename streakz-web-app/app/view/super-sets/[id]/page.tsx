'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { StreakGrid } from '@/components/streak-grid'
import { TrackedValueSummary } from '@/components/tracked-value-summary'
import { Goal } from '@/components/goal'
import { Checklist } from '@/components/checklist'
import type { Streak as StreakType, TrackedValue, Goal as GoalType, ChecklistItem } from '@/types/streak'

const COLORS = [
  'bg-emerald-100 text-emerald-950',
  'bg-blue-100 text-blue-950',
  'bg-purple-100 text-purple-950',
  'bg-pink-100 text-pink-950',
  'bg-orange-100 text-orange-950',
  'bg-teal-100 text-teal-950'
]

const EMPTY_COLOR = 'bg-gray-100 text-gray-950'

interface SuperSetResponse {
  name: string
  sets: Array<{
    id: string
    type: 'streak' | 'trackedValue' | 'goal' | 'checklist'
    name: string
    items: Array<StreakType | TrackedValue | GoalType | ChecklistItem>
  }>
}

export default function ReadOnlySuperSetView() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [superSet, setSuperSet] = useState<SuperSetResponse>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    async function fetchSuperSet() {
      try {
        const response = await fetch(`/api/super-sets/read-only?id=${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch super set')
        }
        const data = await response.json()
        setSuperSet(data)
      } catch (error) {
        console.error('Error fetching super set:', error)
        setError('Failed to load super set')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuperSet()
  }, [params.id])

  useEffect(() => {
    if (superSet?.name) {
      document.title = `${superSet.name} | Streakz`
    }
  }, [superSet?.name])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !superSet) {
    return <div className="text-red-500">{error || 'Failed to load super set'}</div>
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">{superSet.name}</h1>

        {superSet.sets.map((set) => (
          <section key={set.id} id={set.id} className="scroll-mt-8">
            <h2 className="text-xl font-semibold mb-4">{set.name}</h2>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {set.type === 'streak' && (
                (set.items as StreakType[]).map((streak, index) => (
                  <StreakGrid
                    key={streak.id}
                    name={streak.name}
                    contributions={streak.contributions}
                    color={`bg-${['green', 'blue', 'purple', 'pink', 'orange', 'teal'][index % 6]}-600`}
                    hasBorder
                  />
                ))
              )}

              {set.type === 'trackedValue' && (
                (set.items as TrackedValue[]).map((item, index) => {
                  const latestValue = Object.entries(item.values)
                    .sort(([a], [b]) => b.localeCompare(a))[0]?.[1] ?? item.startValue
                  const hasProgress = latestValue !== item.startValue

                  return (
                    <TrackedValueSummary
                      key={item.id}
                      trackedValue={item}
                      color={hasProgress ? COLORS[index % COLORS.length] : EMPTY_COLOR}
                      showDetails={false}
                      variant="compact"
                      showProgressBar={false}
                      minimizeText={true}
                      isReadOnly={true}
                    />
                  )
                })
              )}

              {set.type === 'goal' && (
                (set.items as GoalType[]).map((item, index) => {
                  const hasProgress = Object.keys(item.progress).length > 0

                  return (
                    <Goal
                      key={item.id}
                      goal={item}
                      color={hasProgress ? COLORS[index % COLORS.length] : EMPTY_COLOR}
                      showDetails={false}
                      variant="compact"
                      showProgressBar={false}
                      minimizeText={true}
                      isReadOnly={true}
                    />
                  )
                })
              )}

              {set.type === 'checklist' && (
                <Checklist
                  id={set.id}
                  name={set.name}
                  items={set.items as ChecklistItem[]}
                  showLink={false}
                  isReadOnly={true}
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