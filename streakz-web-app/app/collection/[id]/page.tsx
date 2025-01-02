'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StreakGrid } from '@/components/streak-grid'
import type { Streak } from '@/types/streak'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface CollectionResponse {
  name: string
  streaks: Streak[]
}

export default function CollectionView() {
  const { id } = useParams()
  const [collection, setCollection] = useState<CollectionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) return <div>Loading...</div>
  if (!collection) return <div>Collection not found</div>
  if (!collection.streaks) return <div>No streaks found in this collection</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{collection.name}</h1>
      <div className="space-y-8">
        {(collection.streaks || []).map(streak => (
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
            />
          </div>
        ))}
      </div>
    </main>
  )
}

