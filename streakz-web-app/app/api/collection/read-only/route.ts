import { NextResponse } from 'next/server'
import { db as firebaseDb } from '@/lib/firebase'
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore'
import type { Collection } from '@/types/streak'

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

    // First, get the read-only view to find the parent collection
    const readOnlyViewsRef = collection(firebaseDb, 'readOnlyViews')
    const q = query(readOnlyViewsRef, where('id', '==', id), where('type', '==', 'collection'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Read-only view not found' },
        { status: 404 }
      )
    }

    const readOnlyView = querySnapshot.docs[0].data()

    // Then, get the actual collection data
    const collectionRef = doc(firebaseDb, 'collections', readOnlyView.parentId)
    const collectionDoc = await getDoc(collectionRef)

    if (!collectionDoc.exists()) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const collectionData = collectionDoc.data() as Collection
    const streaks = []

    // Fetch all streaks in the collection
    for (const streakId of collectionData.streakIds) {
      const streakRef = doc(firebaseDb, 'streaks', streakId)
      const streakDoc = await getDoc(streakRef)
      if (streakDoc.exists()) {
        streaks.push(streakDoc.data())
      }
    }

    return NextResponse.json({
      name: collectionData.name,
      streaks
    })
  } catch (error) {
    console.error('Failed to fetch read-only collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch read-only collection' },
      { status: 500 }
    )
  }
} 