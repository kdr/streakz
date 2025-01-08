'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { TrackedValueSummary } from '@/components/tracked-value-summary'
import { TrackedValueLineChart } from '@/components/tracked-value-line-chart'
import { Button } from '@/components/ui/button'
import type { TrackedValue } from '@/types/streak'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

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

interface TrackedValueSetResponse {
  name: string
  trackedValues: TrackedValue[]
}

export default function TrackedValueSetView() {
  const { id } = useParams()
  const [trackedValueSet, setTrackedValueSet] = useState<TrackedValueSetResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<ViewType>('summary')
  const [timeRange, setTimeRange] = useState<TimeRange>('ytd')
  const [showTarget, setShowTarget] = useState(false)

  const fetchTrackedValueSet = useCallback(async () => {
    try {
      const response = await fetch(`/api/tracked-values?id=${id}`)
      const data = await response.json()
      setTrackedValueSet(data)
    } catch (error) {
      console.error('Failed to fetch tracked value set:', error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const handleRecordValue = async (trackedValueId: string, date: string, value: number) => {
    try {
      const response = await fetch('/api/tracked-value/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: trackedValueId,
          date,
          value
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to record value')
      }
      
      fetchTrackedValueSet()
    } catch (error) {
      console.error('Failed to record value:', error)
    }
  }

  useEffect(() => {
    fetchTrackedValueSet()
  }, [fetchTrackedValueSet])

  useEffect(() => {
    if (trackedValueSet?.name) {
      document.title = `${trackedValueSet.name} | Value Tracker Set`
    }
  }, [trackedValueSet?.name])

  if (isLoading) return <div>Loading...</div>
  if (!trackedValueSet) return <div>Value tracker set not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{trackedValueSet?.name}</h1>
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Button
              variant={viewType === 'summary' ? 'default' : 'outline'}
              onClick={() => setViewType('summary')}
            >
              Summary View
            </Button>
            <Button
              variant={viewType === 'trends' ? 'default' : 'outline'}
              onClick={() => setViewType('trends')}
            >
              Trends
            </Button>
          </div>
          {viewType === 'trends' && (
            <>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === 'ytd' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('ytd')}
                >
                  YTD
                </Button>
                <Button
                  variant={timeRange === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('year')}
                >
                  Full Year
                </Button>
                <Button
                  variant={timeRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  Last Week
                </Button>
                <Button
                  variant={timeRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  Last Month
                </Button>
                <Button
                  variant={timeRange === '90days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('90days')}
                >
                  Last 90 Days
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showTarget ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowTarget(!showTarget)}
                >
                  {showTarget ? 'Hide Target Lines' : 'Show Target Lines'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {trackedValueSet?.trackedValues.map((trackedValue, index) => {
          const color = COLORS[index % COLORS.length]
          const lineColor = LINE_COLORS[index % LINE_COLORS.length]

          if (viewType === 'trends') {
            return (
              <div key={trackedValue.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{trackedValue.name}</h2>
                  </div>
                  <Link href={`/tracked-value/${trackedValue.id}`} className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
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
            <div key={trackedValue.id} className="relative">
              <Link href={`/tracked-value/${trackedValue.id}`} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-4 w-4" />
              </Link>
              <TrackedValueSummary
                trackedValue={trackedValue}
                onRecordValue={(date, value) => handleRecordValue(trackedValue.id, date, value)}
                color={color}
                showDetails={false}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
} 