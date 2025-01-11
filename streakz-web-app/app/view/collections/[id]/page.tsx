'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Collection } from '@/components/collection'
import type { Streak } from '@/types/streak'

export default function ReadOnlyCollectionView() {
  const { id } = useParams()
  const [collection, setCollection] = useState<{ name: string; streaks: Streak[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collection/read-only?id=${id}`)
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
      document.title = `${collection.name} | Streakz View`
    }
  }, [collection?.name])

  if (isLoading) return <div>Loading...</div>
  if (!collection) return <div>Collection not found</div>

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      {collection && (
        <Collection
          name={collection.name}
          streaks={collection.streaks}
          showDetails={false}
          isReadOnly={true}
        />
      )}
    </main>
  )
} 