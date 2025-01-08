import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, setIds } = await request.json()

    if (!name || !setIds || !Array.isArray(setIds)) {
      return NextResponse.json(
        { error: 'Name and setIds array are required' },
        { status: 400 }
      )
    }

    const id = await db.createSuperSet(name, setIds)
    return NextResponse.json({ id })
  } catch (error) {
    console.error('Failed to create super set:', error)
    return NextResponse.json(
      { error: 'Failed to create super set' },
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
        { error: 'Super set ID is required' },
        { status: 400 }
      )
    }

    const superSet = await db.getSuperSet(id)
    
    if (!superSet) {
      return NextResponse.json(
        { error: 'Super set not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(superSet)
  } catch (error) {
    console.error('Error fetching super set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch super set' },
      { status: 500 }
    )
  }
} 