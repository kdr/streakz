import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (typeof body.targetValue !== 'number' || isNaN(body.targetValue)) {
      return NextResponse.json(
        { error: 'Target value must be a number' },
        { status: 400 }
      )
    }

    if (body.startValue !== undefined && (typeof body.startValue !== 'number' || isNaN(body.startValue))) {
      return NextResponse.json(
        { error: 'Start value must be a number' },
        { status: 400 }
      )
    }

    if (body.startDate !== undefined && (typeof body.startDate !== 'string' || !body.startDate.match(/^\d{4}-\d{2}-\d{2}$/))) {
      return NextResponse.json(
        { error: 'Start date must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    const id = await db.createTrackedValue(
      body.name,
      body.targetValue,
      body.startValue,
      body.startDate
    )
    return NextResponse.json({ id })
  } catch (error) {
    console.error('Error creating tracked value:', error)
    return NextResponse.json(
      { error: 'Failed to create tracked value' },
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
        { error: 'Tracked value ID is required' },
        { status: 400 }
      )
    }

    const trackedValue = await db.getTrackedValue(id)
    
    if (!trackedValue) {
      return NextResponse.json(
        { error: 'Tracked value not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(trackedValue)
  } catch (error) {
    console.error('Error fetching tracked value:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracked value' },
      { status: 500 }
    )
  }
} 