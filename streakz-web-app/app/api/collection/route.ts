import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, streakIds } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(streakIds) || streakIds.length === 0) {
      return NextResponse.json(
        { error: 'Streak IDs must be a non-empty array' },
        { status: 400 }
      )
    }

    // Verify all streaks exist before creating collection
    for (const streakId of streakIds) {
      const streak = await db.getStreak(streakId)
      if (!streak) {
        return NextResponse.json(
          { error: `Streak with ID ${streakId} not found` },
          { status: 404 }
        )
      }
    }

    const id = await db.createCollection(name, streakIds)
    return NextResponse.json({ id })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }

    const collection = await db.getCollection(id)
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

