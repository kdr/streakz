import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, trackedValueIds } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(trackedValueIds) || trackedValueIds.length === 0) {
      return NextResponse.json(
        { error: 'Tracked value IDs must be a non-empty array' },
        { status: 400 }
      )
    }

    // Verify all tracked values exist before creating set
    for (const trackedValueId of trackedValueIds) {
      const trackedValue = await db.getTrackedValue(trackedValueId)
      if (!trackedValue) {
        return NextResponse.json(
          { error: `Tracked value with ID ${trackedValueId} not found` },
          { status: 404 }
        )
      }
    }

    const id = await db.createTrackedValueSet(name, trackedValueIds)
    return NextResponse.json({ id })
  } catch (error) {
    console.error('Error creating tracked value set:', error)
    return NextResponse.json(
      { error: 'Failed to create tracked value set' },
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
        { error: 'Tracked value set ID is required' },
        { status: 400 }
      )
    }

    const trackedValueSet = await db.getTrackedValueSet(id)
    
    if (!trackedValueSet) {
      return NextResponse.json(
        { error: 'Tracked value set not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(trackedValueSet)
  } catch (error) {
    console.error('Error fetching tracked value set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracked value set' },
      { status: 500 }
    )
  }
} 