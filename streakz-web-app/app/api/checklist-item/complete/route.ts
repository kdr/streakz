import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { id, date } = await request.json()

    if (!id || !date) {
      return NextResponse.json(
        { error: 'ID and date are required' },
        { status: 400 }
      )
    }

    const success = await db.completeChecklistItem(id, date)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to complete checklist item' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to complete checklist item:', error)
    return NextResponse.json(
      { error: 'Failed to complete checklist item' },
      { status: 500 }
    )
  }
} 