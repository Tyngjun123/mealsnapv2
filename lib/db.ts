import { sql } from '@vercel/postgres'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  google_id: string
  email: string
  name: string
  avatar_url: string
  daily_goal_kcal: number
  height_cm: number | null
  weight_kg: number | null
  age: number | null
  is_pro: boolean
  created_at: string
  goal_weight_kg: number | null
  activity_level: string | null
  weekly_goal: string | null
  sex: string | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
}

export interface WeightLog {
  id: string
  user_id: string
  weight_kg: number
  logged_at: string
  notes: string | null
}

export interface Workout {
  id: string
  user_id: string
  exercise: string
  duration_min: number
  kcal_burned: number
  logged_at: string
}

export interface Meal {
  id: string
  user_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  eaten_at: string
  image_url: string | null
  total_kcal: number
  notes: string | null
  food_items?: FoodItem[]
}

export interface FoodItem {
  id: string
  meal_id: string
  name: string
  amount_g: number
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

// ─── Schema Migration ─────────────────────────────────────────────────────────

export async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      daily_goal_kcal INTEGER DEFAULT 2000,
      height_cm INTEGER,
      weight_kg FLOAT,
      age INTEGER,
      is_pro BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS meals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      meal_type TEXT NOT NULL,
      eaten_at TIMESTAMPTZ DEFAULT NOW(),
      image_url TEXT,
      total_kcal INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS food_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      amount_g FLOAT DEFAULT 0,
      kcal INTEGER NOT NULL,
      protein_g FLOAT DEFAULT 0,
      carbs_g FLOAT DEFAULT 0,
      fat_g FLOAT DEFAULT 0
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_meals_eaten_at ON meals(eaten_at)`
  await sql`CREATE INDEX IF NOT EXISTS idx_food_items_meal_id ON food_items(meal_id)`

  // Phase 3 additions: goals columns
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS goal_weight_kg FLOAT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate'`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_goal TEXT DEFAULT 'maintain'`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS sex TEXT`

  // Weight logs table
  await sql`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      weight_kg FLOAT NOT NULL,
      logged_at TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_weight_logs_logged_at ON weight_logs(logged_at)`

  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      subscription TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS workouts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      exercise TEXT NOT NULL,
      duration_min INTEGER NOT NULL,
      kcal_burned INTEGER NOT NULL,
      logged_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_workouts_logged_at ON workouts(logged_at)`

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS protein_target_g INTEGER`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS carbs_target_g INTEGER`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS fat_target_g INTEGER`
}

// ─── Combined Queries (fewer roundtrips) ─────────────────────────────────────

export async function getHomeData(googleId: string) {
  const result = await sql<User & { today_meals: Meal[] }>`
    SELECT u.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.id, 'meal_type', m.meal_type, 'eaten_at', m.eaten_at,
            'total_kcal', m.total_kcal, 'image_url', m.image_url,
            'food_items', (
              SELECT COALESCE(json_agg(
                json_build_object('id', fi.id, 'name', fi.name, 'amount_g', fi.amount_g,
                  'kcal', fi.kcal, 'protein_g', fi.protein_g, 'carbs_g', fi.carbs_g, 'fat_g', fi.fat_g)
              ), '[]'::json)
              FROM food_items fi WHERE fi.meal_id = m.id
            )
          )
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'::json
      ) AS today_meals
    FROM users u
    LEFT JOIN meals m ON m.user_id = u.id AND m.eaten_at::date = CURRENT_DATE
    WHERE u.google_id = ${googleId}
    GROUP BY u.id
  `
  const row = result.rows[0]
  if (!row) return null
  return {
    user: row as User,
    meals: (row.today_meals as unknown as Meal[]) ?? [],
  }
}

// ─── User Queries ─────────────────────────────────────────────────────────────

export async function upsertUser(data: {
  googleId: string
  email: string
  name: string
  avatarUrl: string
}) {
  const result = await sql<User>`
    INSERT INTO users (google_id, email, name, avatar_url)
    VALUES (${data.googleId}, ${data.email}, ${data.name}, ${data.avatarUrl})
    ON CONFLICT (google_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      avatar_url = EXCLUDED.avatar_url
    RETURNING *
  `
  return result.rows[0]
}

export async function getUserByGoogleId(googleId: string) {
  const result = await sql<User>`
    SELECT * FROM users WHERE google_id = ${googleId}
  `
  return result.rows[0] ?? null
}

export async function updateUser(googleId: string, data: Partial<{
  daily_goal_kcal: number
  height_cm: number
  weight_kg: number
  age: number
  name: string
  protein_target_g: number
  carbs_target_g: number
  fat_target_g: number
}>) {
  if (data.daily_goal_kcal !== undefined) {
    await sql`UPDATE users SET daily_goal_kcal = ${data.daily_goal_kcal} WHERE google_id = ${googleId}`
  }
  if (data.height_cm !== undefined) {
    await sql`UPDATE users SET height_cm = ${data.height_cm} WHERE google_id = ${googleId}`
  }
  if (data.weight_kg !== undefined) {
    await sql`UPDATE users SET weight_kg = ${data.weight_kg} WHERE google_id = ${googleId}`
  }
  if (data.age !== undefined) {
    await sql`UPDATE users SET age = ${data.age} WHERE google_id = ${googleId}`
  }
  if (data.name !== undefined) {
    await sql`UPDATE users SET name = ${data.name} WHERE google_id = ${googleId}`
  }
  if (data.protein_target_g !== undefined) {
    await sql`UPDATE users SET protein_target_g = ${data.protein_target_g} WHERE google_id = ${googleId}`
  }
  if (data.carbs_target_g !== undefined) {
    await sql`UPDATE users SET carbs_target_g = ${data.carbs_target_g} WHERE google_id = ${googleId}`
  }
  if (data.fat_target_g !== undefined) {
    await sql`UPDATE users SET fat_target_g = ${data.fat_target_g} WHERE google_id = ${googleId}`
  }
}

export async function updateUserGoals(googleId: string, data: Partial<{
  goal_weight_kg: number | null
  activity_level: string
  weekly_goal: string
  sex: string
}>) {
  if (data.goal_weight_kg !== undefined) {
    await sql`UPDATE users SET goal_weight_kg = ${data.goal_weight_kg} WHERE google_id = ${googleId}`
  }
  if (data.activity_level !== undefined) {
    await sql`UPDATE users SET activity_level = ${data.activity_level} WHERE google_id = ${googleId}`
  }
  if (data.weekly_goal !== undefined) {
    await sql`UPDATE users SET weekly_goal = ${data.weekly_goal} WHERE google_id = ${googleId}`
  }
  if (data.sex !== undefined) {
    await sql`UPDATE users SET sex = ${data.sex} WHERE google_id = ${googleId}`
  }
}

// ─── Weight Log Queries ────────────────────────────────────────────────────────

export async function addWeightLog(userId: string, weightKg: number, notes?: string) {
  const result = await sql<WeightLog>`
    INSERT INTO weight_logs (user_id, weight_kg, notes)
    VALUES (${userId}, ${weightKg}, ${notes ?? null})
    RETURNING *
  `
  return result.rows[0]
}

export async function savePushSubscription(userId: string, subscription: object) {
  await sql`
    INSERT INTO push_subscriptions (user_id, subscription)
    VALUES (${userId}, ${JSON.stringify(subscription)})
    ON CONFLICT (user_id) DO UPDATE SET subscription = EXCLUDED.subscription, updated_at = NOW()
  `
}

export async function getPushSubscriptions(): Promise<{ user_id: string; subscription: string }[]> {
  const result = await sql<{ user_id: string; subscription: string }>`
    SELECT ps.user_id, ps.subscription
    FROM push_subscriptions ps
    JOIN users u ON u.id = ps.user_id
    WHERE u.google_id NOT LIKE 'guest_%'
  `
  return result.rows
}

export async function deletePushSubscription(userId: string) {
  await sql`DELETE FROM push_subscriptions WHERE user_id = ${userId}`
}

export async function logWorkout(userId: string, exercise: string, durationMin: number, kcalBurned: number): Promise<Workout> {
  const result = await sql<Workout>`
    INSERT INTO workouts (user_id, exercise, duration_min, kcal_burned)
    VALUES (${userId}, ${exercise}, ${durationMin}, ${kcalBurned})
    RETURNING *
  `
  return result.rows[0]
}

export async function getTodayWorkouts(userId: string): Promise<Workout[]> {
  const result = await sql<Workout>`
    SELECT * FROM workouts
    WHERE user_id = ${userId}
      AND logged_at::date = CURRENT_DATE
    ORDER BY logged_at DESC
  `
  return result.rows
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await sql`DELETE FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}`
}

export async function getStreak(userId: string): Promise<number> {
  const result = await sql<{ day: string }>`
    SELECT DISTINCT eaten_at::date AS day
    FROM meals WHERE user_id = ${userId}
      AND eaten_at::date >= CURRENT_DATE - 365
    ORDER BY day DESC
  `
  const days = result.rows.map(r => new Date(r.day).toISOString().slice(0, 10))
  if (days.length === 0) return 0

  // Build a Set for O(1) lookup
  const set = new Set(days)

  // Use server UTC date as anchor; allow grace if today not yet logged
  const todayUTC = new Date().toISOString().slice(0, 10)
  const anchor = set.has(todayUTC) ? todayUTC : (() => {
    const y = new Date(); y.setUTCDate(y.getUTCDate() - 1)
    return y.toISOString().slice(0, 10)
  })()
  if (!set.has(anchor)) return 0

  let streak = 0
  const cursor = new Date(anchor)
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

export async function getWeightLogs(userId: string, limit = 60): Promise<WeightLog[]> {
  const result = await sql<WeightLog>`
    SELECT * FROM weight_logs
    WHERE user_id = ${userId}
    ORDER BY logged_at DESC
    LIMIT ${limit}
  `
  return result.rows
}

// ─── Meal Queries ─────────────────────────────────────────────────────────────

export async function createMeal(data: {
  userId: string
  mealType: string
  imageUrl?: string
  totalKcal: number
  foodItems: Array<{ name: string; amount_g: number; kcal: number; protein_g: number; carbs_g: number; fat_g: number }>
}) {
  const mealResult = await sql<Meal>`
    INSERT INTO meals (user_id, meal_type, image_url, total_kcal)
    VALUES (${data.userId}, ${data.mealType}, ${data.imageUrl ?? null}, ${data.totalKcal})
    RETURNING *
  `
  const meal = mealResult.rows[0]

  for (const item of data.foodItems) {
    await sql`
      INSERT INTO food_items (meal_id, name, amount_g, kcal, protein_g, carbs_g, fat_g)
      VALUES (${meal.id}, ${item.name}, ${item.amount_g}, ${item.kcal}, ${item.protein_g}, ${item.carbs_g}, ${item.fat_g})
    `
  }
  return meal
}

export async function getTodayMeals(userId: string): Promise<Meal[]> {
  const meals = await sql<Meal>`
    SELECT m.*,
      json_agg(fi.*) FILTER (WHERE fi.id IS NOT NULL) AS food_items
    FROM meals m
    LEFT JOIN food_items fi ON fi.meal_id = m.id
    WHERE m.user_id = ${userId}
      AND m.eaten_at::date = CURRENT_DATE
    GROUP BY m.id
    ORDER BY m.eaten_at ASC
  `
  return meals.rows
}

export async function getMealsByDateRange(userId: string, days: number): Promise<Meal[]> {
  const meals = await sql<Meal>`
    SELECT m.*,
      json_agg(fi.*) FILTER (WHERE fi.id IS NOT NULL) AS food_items
    FROM meals m
    LEFT JOIN food_items fi ON fi.meal_id = m.id
    WHERE m.user_id = ${userId}
      AND m.eaten_at >= NOW() - (${days} * INTERVAL '1 day')
    GROUP BY m.id
    ORDER BY m.eaten_at DESC
  `
  return meals.rows
}

export async function deleteMeal(mealId: string, userId: string) {
  await sql`DELETE FROM meals WHERE id = ${mealId} AND user_id = ${userId}`
}

export async function getDailyTotals(userId: string, days: number) {
  const result = await sql<{ date: string; total_kcal: number; protein_g: number; carbs_g: number; fat_g: number }>`
    SELECT
      m.eaten_at::date AS date,
      SUM(m.total_kcal) AS total_kcal,
      COALESCE(SUM(fi.protein_g), 0) AS protein_g,
      COALESCE(SUM(fi.carbs_g), 0) AS carbs_g,
      COALESCE(SUM(fi.fat_g), 0) AS fat_g
    FROM meals m
    LEFT JOIN food_items fi ON fi.meal_id = m.id
    WHERE m.user_id = ${userId}
      AND m.eaten_at >= NOW() - (${days} * INTERVAL '1 day')
    GROUP BY m.eaten_at::date
    ORDER BY date DESC
  `
  return result.rows
}
