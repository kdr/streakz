'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StreakGrid } from '@/components/streak-grid'
import type { Streak } from '@/types/streak'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CollectionResponse {
  name: string
  streaks: Streak[]
}

const STREAK_COLORS = [
  'bg-green-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-orange-600',
  'bg-teal-600'
]

export default function CollectionView() {
  const { id } = useParams()
  const [collection, setCollection] = useState<CollectionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleShare = async () => {
    try {
      const response = await fetch('/api/read-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: id,
          type: 'collection'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create read-only view')
      }

      const { id: readOnlyId } = await response.json()
      window.location.href = `/view/collections/${readOnlyId}`
    } catch (error) {
      console.error('Failed to create read-only view:', error)
    }
  }

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collection?id=${id}&year=${new Date().getFullYear()}`)
        const data = await response.json()
        setCollection(data)
      } catch (error) {
        console.error('Failed to fetch collection:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollection()
  }, [id])

  useEffect(() => {
    if (collection?.name) {
      document.title = `${collection.name} | Streakz`
    }
  }, [collection?.name])

  if (isLoading) return <div>Loading...</div>
  if (!collection) return <div>Collection not found</div>
  if (!collection.streaks) return <div>No streaks found in this collection</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">{collection.name}</h1>
        <Button variant="outline" onClick={handleShare}>
          Share as Read-only
        </Button>
      </div>
      <div className="space-y-8">
        {(collection.streaks || []).map((streak, index) => (
          <div key={streak.id} className="relative">
            <Link
              href={`/streak/${streak.id}`}
              className="absolute right-4 top-4 p-2 hover:bg-muted rounded-full transition-colors"
              aria-label={`View ${streak.name} streak details`}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <StreakGrid
              name={streak.name}
              contributions={streak.contributions}
              color={STREAK_COLORS[index % STREAK_COLORS.length]}
            />
          </div>
        ))}
      </div>
    </main>
  )
}

