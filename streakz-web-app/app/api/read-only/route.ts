import { NextResponse } from 'next/server'
import { db as firebaseDb } from '@/lib/firebase'
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore'

// Mark route as dynamic
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { parentId, type } = await request.json()

    // Check if a read-only view already exists
    const readOnlyViewsRef = collection(firebaseDb, 'readOnlyViews')
    const q = query(readOnlyViewsRef, where('parentId', '==', parentId), where('type', '==', type))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const existingView = querySnapshot.docs[0].data()
      return NextResponse.json(existingView)
    }

    // Create new read-only view
    const newViewRef = doc(readOnlyViewsRef)
    const view = {
      id: newViewRef.id,
      parentId,
      type,
      createdAt: new Date().toISOString()
    }
    
    await setDoc(newViewRef, view)
    return NextResponse.json(view)
  } catch (error) {
    console.error('Failed to create read-only view:', error)
    return NextResponse.json(
      { error: 'Failed to create read-only view' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const type = searchParams.get('type')

    if (!parentId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const readOnlyViewsRef = collection(firebaseDb, 'readOnlyViews')
    const q = query(readOnlyViewsRef, where('parentId', '==', parentId), where('type', '==', type))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Read-only view not found' },
        { status: 404 }
      )
    }

    const readOnlyView = querySnapshot.docs[0].data()
    return NextResponse.json(readOnlyView)
  } catch (error) {
    console.error('Failed to fetch read-only view:', error)
    return NextResponse.json(
      { error: 'Failed to fetch read-only view' },
      { status: 500 }
    )
  }
} 