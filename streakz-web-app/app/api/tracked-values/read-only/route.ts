import { NextResponse } from 'next/server'
import { db as firebaseDb } from '@/lib/firebase'
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore'
import type { TrackedValueSet } from '@/types/streak'

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

    // First, get the read-only view to find the parent tracked value set
    const readOnlyViewsRef = collection(firebaseDb, 'readOnlyViews')
    const q = query(readOnlyViewsRef, where('id', '==', id), where('type', '==', 'trackedValueSet'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Read-only view not found' },
        { status: 404 }
      )
    }

    const readOnlyView = querySnapshot.docs[0].data()

    // Then, get the actual tracked value set data
    const trackedValueSetRef = doc(firebaseDb, 'trackedValueSets', readOnlyView.parentId)
    const trackedValueSetDoc = await getDoc(trackedValueSetRef)

    if (!trackedValueSetDoc.exists()) {
      return NextResponse.json(
        { error: 'Tracked value set not found' },
        { status: 404 }
      )
    }

    const trackedValueSetData = trackedValueSetDoc.data() as TrackedValueSet
    const trackedValues = []

    // Fetch all tracked values in the set
    for (const trackedValueId of trackedValueSetData.trackedValueIds) {
      const trackedValueRef = doc(firebaseDb, 'trackedValues', trackedValueId)
      const trackedValueDoc = await getDoc(trackedValueRef)
      if (trackedValueDoc.exists()) {
        trackedValues.push(trackedValueDoc.data())
      }
    }

    return NextResponse.json({
      name: trackedValueSetData.name,
      trackedValues
    })
  } catch (error) {
    console.error('Failed to fetch read-only tracked value set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch read-only tracked value set' },
      { status: 500 }
    )
  }
} 