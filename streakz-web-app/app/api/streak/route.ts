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

    const id = await db.createStreak(body.name)
    return NextResponse.json({ id })
  } catch (error) {
    console.error('Error creating streak:', error)
    return NextResponse.json(
      { error: 'Failed to create streak' },
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
        { error: 'Streak ID is required' },
        { status: 400 }
      )
    }

    const streak = await db.getStreak(id)
    
    if (!streak) {
      return NextResponse.json(
        { error: 'Streak not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(streak)
  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    )
  }
}

