import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home'
}

export default function Home() {
  return (
    <main className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Streakz</h1>
      <p className="text-lg mb-8">
        Track your daily habits and build consistency with Streakz. Whether it&apos;s coding, reading, or exercising,
        visualize your progress over time with our GitHub-inspired contribution calendar.
      </p>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/new/streak">Create a Streak</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/new/collection">Create a Collection</Link>
          </Button>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/new/goal">Create Accumulative Goal</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/new/goals">Create Accumulative Goal Set</Link>
          </Button>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/new/tracked-value">Create Value Tracker</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/new/tracked-values">Create Value Tracker Set</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

