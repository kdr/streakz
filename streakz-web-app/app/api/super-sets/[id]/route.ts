import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const superSet = await db.getSuperSet(params.id)
    
    if (!superSet) {
      return NextResponse.json(
        { error: 'Super set not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(superSet)
  } catch (error) {
    console.error('Failed to fetch super set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch super set' },
      { status: 500 }
    )
  }
} 