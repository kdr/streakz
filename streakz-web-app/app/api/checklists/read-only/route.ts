import { NextResponse } from 'next/server'
import { db as firebaseDb } from '@/lib/firebase'
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore'

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

    // First, get the read-only view to find the parent checklist
    const readOnlyViewsRef = collection(firebaseDb, 'readOnlyViews')
    const q = query(readOnlyViewsRef, where('id', '==', id), where('type', '==', 'checklist'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Read-only view not found' },
        { status: 404 }
      )
    }

    const readOnlyView = querySnapshot.docs[0].data()

    // Then, get the actual checklist data
    const checklistRef = doc(firebaseDb, 'checklists', readOnlyView.parentId)
    const checklistDoc = await getDoc(checklistRef)

    if (!checklistDoc.exists()) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      )
    }

    const checklistData = checklistDoc.data()
    const items = []

    // Fetch all checklist items
    const checklistItemIds = checklistData.checklistItemIds || []
    if (Array.isArray(checklistItemIds)) {
      for (const itemId of checklistItemIds) {
        const itemRef = doc(firebaseDb, 'checklistItems', itemId)
        const itemDoc = await getDoc(itemRef)
        if (itemDoc.exists()) {
          items.push({
            id: itemDoc.id,
            ...itemDoc.data()
          })
        }
      }
    }

    return NextResponse.json({
      name: checklistData.name,
      items
    })
  } catch (error) {
    console.error('Failed to fetch read-only checklist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch read-only checklist' },
      { status: 500 }
    )
  }
} 