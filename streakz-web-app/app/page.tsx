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
    <main className="container max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Streakz</h1>
      <p className="text-lg mb-12">
        Track your habits, goals, and progress all in one place.
      </p>

      <div className="space-y-12">
        {/* Streaks Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Habit Tracking</h2>
          <p className="text-muted-foreground mb-6">
            Track daily habits and build streaks. Perfect for activities you want to do consistently, like exercise, reading, or meditation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Link href="/new/streak">
                <Button className="w-full">🎯 Create New Streak</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Start with a single habit you want to track daily.
              </p>
            </div>
            <div>
              <Link href="/new/collection">
                <Button className="w-full">📚 Create New Streak Collection</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Group related habits together, like morning or evening routines.
              </p>
            </div>
          </div>
        </section>

        {/* Value Trackers Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Progress Tracking</h2>
          <p className="text-muted-foreground mb-6">
            Track numerical values that change over time, like weight, savings, or any other measurable progress.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Link href="/new/tracked-value">
                <Button className="w-full">📈 Create New Value Tracker</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Track a single value that changes over time, like your weight or savings.
              </p>
            </div>
            <div>
              <Link href="/new/tracked-values">
                <Button className="w-full">📊 Create New Value Tracker Set</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Group related trackers together, like body measurements or financial goals.
              </p>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Goal Setting</h2>
          <p className="text-muted-foreground mb-6">
            Set and track progress towards specific numerical goals, like running 100 miles or reading 24 books this year.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Link href="/new/goal">
                <Button className="w-full">🎯 Create New Count Goal</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Set a single goal with a target number to reach, like reading 24 books.
              </p>
            </div>
            <div>
              <Link href="/new/goal-set">
                <Button className="w-full">🎯 Create New Count Goal Set</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Group related goals together, like fitness targets or yearly objectives.
              </p>
            </div>
          </div>
        </section>

        {/* Checklists Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Checklists</h2>
          <p className="text-muted-foreground mb-6">
            Create lists of tasks or items that can be checked off, perfect for recurring tasks or project tracking.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Link href="/new/checklist-item">
                <Button className="w-full">✅ Create New Checklist Item</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Create a single task or item that can be checked off.
              </p>
            </div>
            <div>
              <Link href="/new/checklist">
                <Button className="w-full">📝 Create New Checklist</Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                Group related items into a checklist, like a weekly review or project tasks.
              </p>
            </div>
          </div>
        </section>

        {/* Super Sets Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Super Sets</h2>
          <p className="text-muted-foreground mb-6">
            Combine different types of trackers into a single view. Perfect for comprehensive tracking of related goals, habits, and checklists.
          </p>
          <Link href="/new/super-set">
            <Button className="w-full" variant="outline">🌟 Create New Super Set</Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Create a dashboard that combines streaks, value trackers, goals, and checklists in one place.
          </p>
        </section>

        {superSets.length > 0 && (
          <section>
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
          </section>
        )}
      </div>
    </main>
  )
}

