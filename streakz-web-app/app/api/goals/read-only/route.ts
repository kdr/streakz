import { NextResponse } from 'next/server'
import { db as firebaseDb } from '@/lib/firebase'
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore'
import type { GoalSet } from '@/types/streak'

// Mark route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // First, get the read-only view to find the parent goal set
    const readOnlyViewsRef = collection(firebaseDb, 'readOnlyViews')
    const q = query(readOnlyViewsRef, where('id', '==', id), where('type', '==', 'goalSet'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Read-only view not found' },
        { status: 404 }
      )
    }

    const readOnlyView = querySnapshot.docs[0].data()

    // Then, get the actual goal set data
    const goalSetRef = doc(firebaseDb, 'goalSets', readOnlyView.parentId)
    const goalSetDoc = await getDoc(goalSetRef)

    if (!goalSetDoc.exists()) {
      return NextResponse.json(
        { error: 'Goal set not found' },
        { status: 404 }
      )
    }

    const goalSetData = goalSetDoc.data() as GoalSet
    const goals = []

    // Fetch all goals in the set
    for (const goalId of goalSetData.goalIds) {
      const goalRef = doc(firebaseDb, 'goals', goalId)
      const goalDoc = await getDoc(goalRef)
      if (goalDoc.exists()) {
        goals.push(goalDoc.data())
      }
    }

    return NextResponse.json({
      name: goalSetData.name,
      goals
    })
  } catch (error) {
    console.error('Failed to fetch read-only goal set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch read-only goal set' },
      { status: 500 }
    )
  }
} 