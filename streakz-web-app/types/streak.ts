export interface Streak {
  id: string
  name: string
  contributions: Record<string, number>
}

export interface Collection {
  id: string
  name: string
  streakIds: string[]
}

export interface Goal {
  id: string
  name: string
  targetValue: number
  progress: Record<string, number>
}

export interface GoalSet {
  id: string
  name: string
  goalIds: string[]
}

export interface TrackedValue {
  id: string
  name: string
  targetValue: number
  startValue: number
  startDate: string // YYYY-MM-DD format
  values: Record<string, number>
}

export interface TrackedValueSet {
  id: string
  name: string
  trackedValueIds: string[]
}

export interface SuperSet {
  id: string
  name: string
  setIds: Array<{
    id: string
    type: 'streak' | 'trackedValue' | 'goal'
  }>
}

