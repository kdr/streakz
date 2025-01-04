import { db as firebaseDb } from './firebase'
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { Streak, Collection } from '@/types/streak'

class Database {
  // Streak methods
  async createStreak(name: string): Promise<string> {
    const streaksRef = collection(firebaseDb, 'streaks')
    const newStreakRef = doc(streaksRef)
    
    const streak: Streak = {
      id: newStreakRef.id,
      name: name.trim(),
      contributions: {}
    }
    
    await setDoc(newStreakRef, streak)
    return newStreakRef.id
  }

  async getStreak(id: string): Promise<Streak | undefined> {
    const streakRef = doc(firebaseDb, 'streaks', id)
    const streakDoc = await getDoc(streakRef)
    
    if (!streakDoc.exists()) return undefined
    return streakDoc.data() as Streak
  }

  async updateStreakContribution(id: string, date: string): Promise<boolean> {
    const streakRef = doc(firebaseDb, 'streaks', id)
    const streakDoc = await getDoc(streakRef)
    
    if (!streakDoc.exists()) return false
    
    const streak = streakDoc.data() as Streak
    streak.contributions[date] = (streak.contributions[date] || 0) + 1
    
    await updateDoc(streakRef, {
      [`contributions.${date}`]: streak.contributions[date]
    })
    
    return true
  }

  async removeStreakContribution(id: string, date: string): Promise<boolean> {
    const streakRef = doc(firebaseDb, 'streaks', id)
    const streakDoc = await getDoc(streakRef)
    
    if (!streakDoc.exists()) return false
    
    const streak = streakDoc.data() as Streak
    if (!streak.contributions[date]) return false
    
    delete streak.contributions[date]
    
    await updateDoc(streakRef, {
      [`contributions.${date}`]: null
    })
    
    return true
  }

  // Collection methods
  async createCollection(name: string, streakIds: string[]): Promise<string> {
    const collectionsRef = collection(firebaseDb, 'collections')
    const newCollectionRef = doc(collectionsRef)
    
    const newCollection: Collection = {
      id: newCollectionRef.id,
      name: name.trim(),
      streakIds
    }
    
    await setDoc(newCollectionRef, newCollection)
    return newCollectionRef.id
  }

  async getCollection(id: string): Promise<{ name: string; streaks: Streak[] } | undefined> {
    const collectionRef = doc(firebaseDb, 'collections', id)
    const collectionDoc = await getDoc(collectionRef)
    
    if (!collectionDoc.exists()) return undefined
    
    const collectionData = collectionDoc.data() as Collection
    const streaks: Streak[] = []
    
    for (const streakId of collectionData.streakIds) {
      const streak = await this.getStreak(streakId)
      if (streak) streaks.push(streak)
    }
    
    return {
      name: collectionData.name,
      streaks
    }
  }
}

export const db = new Database()

