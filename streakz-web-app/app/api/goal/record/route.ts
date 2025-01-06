import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { id, date, value } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }

    if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json(
        { error: 'Valid date in YYYY-MM-DD format is required' },
        { status: 400 }
      )
    }

    if (typeof value !== 'number' || isNaN(value)) {
      return NextResponse.json(
        { error: 'Value must be a number' },
        { status: 400 }
      )
    }

    const success = await db.updateGoalProgress(id, date, value)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update goal progress' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating goal progress:', error)
    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    )
  }
} 