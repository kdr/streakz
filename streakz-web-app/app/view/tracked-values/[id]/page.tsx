'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TrackedValueSummary } from '@/components/tracked-value-summary'
import { TrackedValueLineChart } from '@/components/tracked-value-line-chart'
import type { TrackedValue } from '@/types/streak'

const COLORS = [
  'bg-green-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-orange-600',
  'bg-teal-600'
]

const LINE_COLORS = [
  '#16a34a', // green-600
  '#2563eb', // blue-600
  '#9333ea', // purple-600
  '#db2777', // pink-600
  '#ea580c', // orange-600
  '#0d9488', // teal-600
]

type ViewType = 'summary' | 'trends'
type TimeRange = 'ytd' | 'week' | 'month' | '90days' | 'year'

export default function ReadOnlyTrackedValueSetView() {
  const { id } = useParams()
  const [trackedValueSet, setTrackedValueSet] = useState<{ name: string; trackedValues: TrackedValue[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<ViewType>('summary')
  const [timeRange, setTimeRange] = useState<TimeRange>('ytd')
  const [showTarget, setShowTarget] = useState(false)

  useEffect(() => {
    const fetchTrackedValueSet = async () => {
      try {
        const response = await fetch(`/api/tracked-values/read-only?id=${id}`)
        const data = await response.json()
        setTrackedValueSet(data)
      } catch (error) {
        console.error('Failed to fetch tracked value set:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrackedValueSet()
  }, [id])

  useEffect(() => {
    if (trackedValueSet?.name) {
      document.title = `${trackedValueSet.name} | Value Tracker View`
    }
  }, [trackedValueSet?.name])

  if (isLoading) return <div>Loading...</div>
  if (!trackedValueSet) return <div>Value tracker set not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{trackedValueSet.name}</h1>
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg ${viewType === 'summary' ? 'bg-primary text-primary-foreground' : 'border'}`}
              onClick={() => setViewType('summary')}
            >
              Summary View
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${viewType === 'trends' ? 'bg-primary text-primary-foreground' : 'border'}`}
              onClick={() => setViewType('trends')}
            >
              Trends
            </button>
          </div>
          {viewType === 'trends' && (
            <>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'ytd' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('ytd')}
                >
                  YTD
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'year' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('year')}
                >
                  Full Year
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'week' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('week')}
                >
                  Last Week
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'month' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('month')}
                >
                  Last Month
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${timeRange === '90days' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setTimeRange('90days')}
                >
                  Last 90 Days
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-lg text-sm ${showTarget ? 'bg-primary text-primary-foreground' : 'border'}`}
                  onClick={() => setShowTarget(!showTarget)}
                >
                  {showTarget ? 'Hide Target Lines' : 'Show Target Lines'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {trackedValueSet.trackedValues.map((trackedValue, index) => {
          const color = COLORS[index % COLORS.length]
          const lineColor = LINE_COLORS[index % LINE_COLORS.length]

          if (viewType === 'trends') {
            return (
              <div key={trackedValue.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{trackedValue.name}</h2>
                  </div>
                </div>
                <TrackedValueLineChart
                  trackedValue={trackedValue}
                  color={lineColor}
                  timeRange={timeRange}
                  showTarget={showTarget}
                />
              </div>
            )
          }

          return (
            <div key={trackedValue.id}>
              <TrackedValueSummary
                trackedValue={trackedValue}
                color={color}
                showDetails={false}
                isReadOnly={true}
                showProgressBar={true}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
} 