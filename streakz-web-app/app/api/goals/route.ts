import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, goalIds } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return NextResponse.json(
        { error: 'Goal IDs must be a non-empty array' },
        { status: 400 }
      )
    }

    // Verify all goals exist before creating goal set
    for (const goalId of goalIds) {
      const goal = await db.getGoal(goalId)
      if (!goal) {
        return NextResponse.json(
          { error: `Goal with ID ${goalId} not found` },
          { status: 404 }
        )
      }
    }

    const id = await db.createGoalSet(name, goalIds)
    return NextResponse.json({ id })
  } catch (error) {
    console.error('Error creating goal set:', error)
    return NextResponse.json(
      { error: 'Failed to create goal set' },
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
        { error: 'Goal set ID is required' },
        { status: 400 }
      )
    }

    const goalSet = await db.getGoalSet(id)
    
    if (!goalSet) {
      return NextResponse.json(
        { error: 'Goal set not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(goalSet)
  } catch (error) {
    console.error('Error fetching goal set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal set' },
      { status: 500 }
    )
  }
} 