import { NextResponse } from 'next/server'
import { db } from '@/lib/mock-db'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Streak ID is required' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const success = await db.updateStreakContribution(id, today)
    
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

