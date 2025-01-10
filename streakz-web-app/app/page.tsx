'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { SuperSet } from '@/types/streak'

export default function Home() {
  const [superSets, setSuperSets] = useState<SuperSet[]>([])

  useEffect(() => {
    const loadSuperSets = async () => {
      try {
        const response = await fetch('/api/super-sets')
        const data = await response.json()
        setSuperSets(data)
      } catch (error) {
        console.error('Failed to load super sets:', error)
      }
    }

    loadSuperSets()
  }, [])

  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Streakz</h1>
      <p className="text-lg mb-8">
        Track your habits, goals, and progress all in one place.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/new/streak">
            <Button className="w-full">Create New Streak</Button>
          </Link>
          <Link href="/new/collection">
            <Button className="w-full">Create New Streak Collection</Button>
          </Link>
          <Link href="/new/tracked-value">
            <Button className="w-full">Create New Value Tracker</Button>
          </Link>
          <Link href="/new/tracked-values">
            <Button className="w-full">Create New Value Tracker Set</Button>
          </Link>
          <Link href="/new/goal">
            <Button className="w-full">Create New Count Goal</Button>
          </Link>
          <Link href="/new/goal-set">
            <Button className="w-full">Create New Count Goal Set</Button>
          </Link>
          <Link href="/new/checklist-item">
            <Button className="w-full">Create New Checklist Item</Button>
          </Link>
          <Link href="/new/checklist">
            <Button className="w-full">Create New Checklist</Button>
          </Link>
        </div>

        <div className="pt-4">
          <Link href="/new/super-set">
            <Button className="w-full" variant="outline">Create New Super Set</Button>
          </Link>
        </div>

        {superSets.length > 0 && (
          <div className="pt-8">
            <h2 className="text-2xl font-bold mb-4">Your Super Sets</h2>
            <div className="space-y-2">
              {superSets.map((superSet) => (
                <Link
                  key={superSet.id}
                  href={`/super-sets/${superSet.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent"
                >
                  {superSet.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

