type HabitHistoryEntry = {
  date: string
  note?: string
  photo?: string
}

export type Habit = {
  id: string
  name: string
  icon: string
  color: string
  category: string
  createdAt: string
  streak: number
  lastChecked: string | null
  history: HabitHistoryEntry[]
}

export type CalendarDayItem = {
  date: string
  isChecked: boolean
  hasPhoto: boolean
  hasNote: boolean
  isToday: boolean
  isInteractive: boolean
  photo: string | null
}
