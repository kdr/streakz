import { db as firebaseDb } from './firebase'
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { Streak, Collection, Goal, GoalSet, TrackedValue, TrackedValueSet, SuperSet } from '@/types/streak'
import { format, startOfYear } from 'date-fns'

interface SuperSetResponse {
  name: string
  sets: Array<{
    id: string
    type: 'streak' | 'trackedValue' | 'goal'
    name: string
    items: Array<Streak | TrackedValue | Goal>
  }>
}

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

  // Tracked Value methods
  async createTrackedValue(name: string, targetValue: number, startValue?: number, startDate?: string): Promise<string> {
    const trackedValuesRef = collection(firebaseDb, 'trackedValues')
    const newTrackedValueRef = doc(trackedValuesRef)
    
    const defaultStartDate = format(startOfYear(new Date()), 'yyyy-MM-dd')
    
    const trackedValue: TrackedValue = {
      id: newTrackedValueRef.id,
      name: name.trim(),
      targetValue,
      startValue: startValue ?? 0,
      startDate: startDate ?? defaultStartDate,
      values: {
        [startDate ?? defaultStartDate]: startValue ?? 0
      }
    }
    
    await setDoc(newTrackedValueRef, trackedValue)
    return newTrackedValueRef.id
  }

  async getTrackedValue(id: string): Promise<TrackedValue | undefined> {
    const trackedValueRef = doc(firebaseDb, 'trackedValues', id)
    const trackedValueDoc = await getDoc(trackedValueRef)
    
    if (!trackedValueDoc.exists()) return undefined
    return trackedValueDoc.data() as TrackedValue
  }

  async updateTrackedValue(id: string, date: string, value: number): Promise<boolean> {
    const trackedValueRef = doc(firebaseDb, 'trackedValues', id)
    const trackedValueDoc = await getDoc(trackedValueRef)
    
    if (!trackedValueDoc.exists()) return false
    
    await updateDoc(trackedValueRef, {
      [`values.${date}`]: value
    })
    
    return true
  }

  // Tracked Value Set methods
  async createTrackedValueSet(name: string, trackedValueIds: string[]): Promise<string> {
    const trackedValueSetsRef = collection(firebaseDb, 'trackedValueSets')
    const newTrackedValueSetRef = doc(trackedValueSetsRef)
    
    const trackedValueSet: TrackedValueSet = {
      id: newTrackedValueSetRef.id,
      name: name.trim(),
      trackedValueIds
    }
    
    await setDoc(newTrackedValueSetRef, trackedValueSet)
    return newTrackedValueSetRef.id
  }

  async getTrackedValueSet(id: string): Promise<{ name: string; trackedValues: TrackedValue[] } | undefined> {
    const trackedValueSetRef = doc(firebaseDb, 'trackedValueSets', id)
    const trackedValueSetDoc = await getDoc(trackedValueSetRef)
    
    if (!trackedValueSetDoc.exists()) return undefined
    
    const trackedValueSetData = trackedValueSetDoc.data() as TrackedValueSet
    const trackedValues: TrackedValue[] = []
    
    for (const trackedValueId of trackedValueSetData.trackedValueIds) {
      const trackedValue = await this.getTrackedValue(trackedValueId)
      if (trackedValue) trackedValues.push(trackedValue)
    }
    
    return {
      name: trackedValueSetData.name,
      trackedValues
    }
  }

  // Super Set methods
  async createSuperSet(name: string, setIds: Array<{ id: string; type: 'streak' | 'trackedValue' | 'goal' }>): Promise<string> {
    const superSetsRef = collection(firebaseDb, 'superSets')
    const newSuperSetRef = doc(superSetsRef)
    
    const superSet: SuperSet = {
      id: newSuperSetRef.id,
      name: name.trim(),
      setIds
    }
    
    await setDoc(newSuperSetRef, superSet)
    return newSuperSetRef.id
  }

  async getSuperSet(id: string): Promise<SuperSetResponse | undefined> {
    const superSetRef = doc(firebaseDb, 'superSets', id)
    const superSetDoc = await getDoc(superSetRef)
    
    if (!superSetDoc.exists()) return undefined
    
    const superSetData = superSetDoc.data() as SuperSet
    const sets: Array<{
      id: string
      type: 'streak' | 'trackedValue' | 'goal'
      name: string
      items: Array<Streak | TrackedValue | Goal>
    }> = []
    
    for (const { id: setId, type } of superSetData.setIds) {
      let name = ''
      let items: Array<Streak | TrackedValue | Goal> = []
      
      if (type === 'streak') {
        const collection = await this.getCollection(setId)
        if (collection) {
          name = collection.name
          items = collection.streaks
        }
      } else if (type === 'trackedValue') {
        const trackedValueSet = await this.getTrackedValueSet(setId)
        if (trackedValueSet) {
          name = trackedValueSet.name
          items = trackedValueSet.trackedValues
        }
      } else if (type === 'goal') {
        const goalSet = await this.getGoalSet(setId)
        if (goalSet) {
          name = goalSet.name
          items = goalSet.goals
        }
      }
      
      if (name) {
        sets.push({
          id: setId,
          type,
          name,
          items
        })
      }
    }
    
    return {
      name: superSetData.name,
      sets
    }
  }
}

export const db = new Database()

