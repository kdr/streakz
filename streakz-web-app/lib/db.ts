import { db as firebaseDb } from './firebase'
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { Streak, Collection, Goal, GoalSet } from '@/types/streak'

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

  async decrementStreakContribution(id: string, date: string): Promise<boolean> {
    const streakRef = doc(firebaseDb, 'streaks', id)
    const streakDoc = await getDoc(streakRef)
    
    if (!streakDoc.exists()) return false
    
    const streak = streakDoc.data() as Streak
    const currentValue = streak.contributions[date] || 0
    
    // Don't allow negative values
    const newValue = Math.max(0, currentValue - 1)
    
    if (newValue === 0) {
      await this.removeStreakContribution(id, date)
    } else {
      await updateDoc(streakRef, {
        [`contributions.${date}`]: newValue
      })
    }
    
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

  // Goal methods
  async createGoal(name: string, targetValue: number): Promise<string> {
    const goalsRef = collection(firebaseDb, 'goals')
    const newGoalRef = doc(goalsRef)
    
    const goal: Goal = {
      id: newGoalRef.id,
      name: name.trim(),
      targetValue,
      progress: {}
    }
    
    await setDoc(newGoalRef, goal)
    return newGoalRef.id
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const goalRef = doc(firebaseDb, 'goals', id)
    const goalDoc = await getDoc(goalRef)
    
    if (!goalDoc.exists()) return undefined
    return goalDoc.data() as Goal
  }

  async updateGoalProgress(id: string, date: string, value: number): Promise<boolean> {
    const goalRef = doc(firebaseDb, 'goals', id)
    const goalDoc = await getDoc(goalRef)
    
    if (!goalDoc.exists()) return false
    
    const goal = goalDoc.data() as Goal
    goal.progress[date] = value
    
    await updateDoc(goalRef, {
      [`progress.${date}`]: value
    })
    
    return true
  }

  // Goal Set methods
  async createGoalSet(name: string, goalIds: string[]): Promise<string> {
    const goalSetsRef = collection(firebaseDb, 'goalSets')
    const newGoalSetRef = doc(goalSetsRef)
    
    const goalSet: GoalSet = {
      id: newGoalSetRef.id,
      name: name.trim(),
      goalIds
    }
    
    await setDoc(newGoalSetRef, goalSet)
    return newGoalSetRef.id
  }

  async getGoalSet(id: string): Promise<{ name: string; goals: Goal[] } | undefined> {
    const goalSetRef = doc(firebaseDb, 'goalSets', id)
    const goalSetDoc = await getDoc(goalSetRef)
    
    if (!goalSetDoc.exists()) return undefined
    
    const goalSetData = goalSetDoc.data() as GoalSet
    const goals: Goal[] = []
    
    for (const goalId of goalSetData.goalIds) {
      const goal = await this.getGoal(goalId)
      if (goal) goals.push(goal)
    }
    
    return {
      name: goalSetData.name,
      goals
    }
  }
}

export const db = new Database()

