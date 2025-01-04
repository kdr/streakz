import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { id, date } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Streak ID is required' },
        { status: 400 }
      )
    }

    if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json(
        { error: 'Valid date in YYYY-MM-DD format is required' },
        { status: 400 }
      )
    }

    const success = await db.updateStreakContribution(id, date)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Streak not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording streak:', error)
    return NextResponse.json(
      { error: 'Failed to record streak' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, date } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Streak ID is required' },
        { status: 400 }
      )
    }

    if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json(
        { error: 'Valid date in YYYY-MM-DD format is required' },
        { status: 400 }
      )
    }

    const success = await db.removeStreakContribution(id, date)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Streak not found or no contribution for today' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing streak contribution:', error)
    return NextResponse.json(
      { error: 'Failed to remove streak contribution' },
      { status: 500 }
    )
  }
}

