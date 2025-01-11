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

    // First, get the read-only view to find the parent super set
    const readOnlyViewsRef = collection(firebaseDb, 'readOnlyViews')
    const q = query(readOnlyViewsRef, where('id', '==', id), where('type', '==', 'superSet'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Read-only view not found' },
        { status: 404 }
      )
    }

    const readOnlyView = querySnapshot.docs[0].data()

    // Then, get the actual super set data
    const superSetRef = doc(firebaseDb, 'superSets', readOnlyView.parentId)
    const superSetDoc = await getDoc(superSetRef)

    if (!superSetDoc.exists()) {
      return NextResponse.json(
        { error: 'Super set not found' },
        { status: 404 }
      )
    }

    const superSetData = superSetDoc.data()
    const sets = []

    // Fetch all sets in the super set
    for (const setInfo of superSetData.setIds) {
      const setItems = []

      switch (setInfo.type) {
        case 'streak': {
          const collectionRef = doc(firebaseDb, 'collections', setInfo.id)
          const collectionDoc = await getDoc(collectionRef)
          if (collectionDoc.exists()) {
            const collectionData = collectionDoc.data()
            // Fetch all streaks in the collection
            for (const streakId of collectionData.streakIds) {
              const streakRef = doc(firebaseDb, 'streaks', streakId)
              const streakDoc = await getDoc(streakRef)
              if (streakDoc.exists()) {
                setItems.push({
                  id: streakDoc.id,
                  ...streakDoc.data()
                })
              }
            }
            sets.push({
              id: collectionDoc.id,
              name: collectionData.name,
              type: 'streak',
              items: setItems
            })
          }
          break
        }
        case 'trackedValue': {
          const trackedValueSetRef = doc(firebaseDb, 'trackedValueSets', setInfo.id)
          const trackedValueSetDoc = await getDoc(trackedValueSetRef)
          if (trackedValueSetDoc.exists()) {
            const trackedValueSetData = trackedValueSetDoc.data()
            // Fetch all tracked values in the set
            for (const trackedValueId of trackedValueSetData.trackedValueIds) {
              const trackedValueRef = doc(firebaseDb, 'trackedValues', trackedValueId)
              const trackedValueDoc = await getDoc(trackedValueRef)
              if (trackedValueDoc.exists()) {
                setItems.push({
                  id: trackedValueDoc.id,
                  ...trackedValueDoc.data()
                })
              }
            }
            sets.push({
              id: trackedValueSetDoc.id,
              name: trackedValueSetData.name,
              type: 'trackedValue',
              items: setItems
            })
          }
          break
        }
        case 'goal': {
          const goalSetRef = doc(firebaseDb, 'goalSets', setInfo.id)
          const goalSetDoc = await getDoc(goalSetRef)
          if (goalSetDoc.exists()) {
            const goalSetData = goalSetDoc.data()
            // Fetch all goals in the set
            for (const goalId of goalSetData.goalIds) {
              const goalRef = doc(firebaseDb, 'goals', goalId)
              const goalDoc = await getDoc(goalRef)
              if (goalDoc.exists()) {
                setItems.push({
                  id: goalDoc.id,
                  ...goalDoc.data()
                })
              }
            }
            sets.push({
              id: goalSetDoc.id,
              name: goalSetData.name,
              type: 'goal',
              items: setItems
            })
          }
          break
        }
        case 'checklist': {
          const checklistRef = doc(firebaseDb, 'checklists', setInfo.id)
          const checklistDoc = await getDoc(checklistRef)
          if (checklistDoc.exists()) {
            const checklistData = checklistDoc.data()
            // Fetch all checklist items
            for (const itemId of checklistData.checklistItemIds) {
              const itemRef = doc(firebaseDb, 'checklistItems', itemId)
              const itemDoc = await getDoc(itemRef)
              if (itemDoc.exists()) {
                setItems.push({
                  id: itemDoc.id,
                  ...itemDoc.data()
                })
              }
            }
            sets.push({
              id: checklistDoc.id,
              name: checklistData.name,
              type: 'checklist',
              items: setItems
            })
          }
          break
        }
      }
    }

    return NextResponse.json({
      name: superSetData.name,
      sets
    })
  } catch (error) {
    console.error('Failed to fetch read-only super set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch read-only super set' },
      { status: 500 }
    )
  }
} 