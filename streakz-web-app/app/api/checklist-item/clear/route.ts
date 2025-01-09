import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const success = await db.clearChecklistItem(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to clear checklist item' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear checklist item:', error)
    return NextResponse.json(
      { error: 'Failed to clear checklist item' },
      { status: 500 }
    )
  }
} 