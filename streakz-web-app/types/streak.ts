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

