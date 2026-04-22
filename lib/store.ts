'use client'
// Phase 1: localStorage store — swap for API calls in Phase 2

export interface UserProfile {
  name: string
  dailyGoalKcal: number
  heightCm: number | null
  weightKg: number | null
  age: number | null
  isPro: boolean
}

export interface FoodItem {
  id: string
  name: string
  amountG: number
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface Meal {
  id: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  eatenAt: string  // ISO string
  imageUrl: string | null
  totalKcal: number
  foodItems: FoodItem[]
}

const PROFILE_KEY = 'ms_profile'
const MEALS_KEY   = 'ms_meals'

// ─── Profile ──────────────────────────────────────────────────

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PROFILE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// ─── Meals ────────────────────────────────────────────────────

function getAllMeals(): Meal[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(MEALS_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveAllMeals(meals: Meal[]) {
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals))
}

export function addMeal(meal: Omit<Meal, 'id'>): Meal {
  const all = getAllMeals()
  const newMeal: Meal = { ...meal, id: crypto.randomUUID() }
  saveAllMeals([newMeal, ...all])
  return newMeal
}

export function deleteMeal(id: string) {
  saveAllMeals(getAllMeals().filter(m => m.id !== id))
}

export function getTodayMeals(): Meal[] {
  const today = new Date().toDateString()
  return getAllMeals().filter(m => new Date(m.eatenAt).toDateString() === today)
}

export function getMealsByDays(days: number): Meal[] {
  const cutoff = Date.now() - days * 86400000
  return getAllMeals().filter(m => new Date(m.eatenAt).getTime() >= cutoff)
}

export interface DailySummary {
  date: string       // 'Mon', 'Tue' etc
  fullDate: string   // YYYY-MM-DD
  totalKcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

export function getDailySummaries(days: number): DailySummary[] {
  const meals = getMealsByDays(days)
  const map: Record<string, DailySummary> = {}

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    map[key] = { date: label, fullDate: key, totalKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  }

  for (const meal of meals) {
    const key = new Date(meal.eatenAt).toISOString().split('T')[0]
    if (!map[key]) continue
    map[key].totalKcal += meal.totalKcal
    for (const fi of meal.foodItems) {
      map[key].proteinG += fi.proteinG
      map[key].carbsG   += fi.carbsG
      map[key].fatG     += fi.fatG
    }
  }

  return Object.values(map)
}

export function getTodayMacros() {
  const meals = getTodayMeals()
  return meals.reduce(
    (acc, m) => {
      for (const fi of m.foodItems) {
        acc.protein += fi.proteinG
        acc.carbs   += fi.carbsG
        acc.fat     += fi.fatG
      }
      return acc
    },
    { protein: 0, carbs: 0, fat: 0 }
  )
}
