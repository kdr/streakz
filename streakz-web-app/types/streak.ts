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

