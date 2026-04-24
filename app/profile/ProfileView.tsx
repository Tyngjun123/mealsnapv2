'use client'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'


interface UserProfile {
  name: string; email: string; avatarUrl: string
  dailyGoalKcal: number; heightCm: number | null
  weightKg: number | null; goalWeightKg: number | null
  age: number | null; isPro: boolean
}
interface Props {
  user: UserProfile
  streak: number
  stats: { totalMeals: number; avgKcalThisWeek: number; activeDaysThisWeek: number }
}

function shareToday(user: UserProfile, stats: Props['stats'], streak: number) {
  const text = `📊 My MealSnap stats\n🔥 ${streak} day streak\n🍽️ ${stats.totalMeals} meals logged\n⚡ ${stats.avgKcalThisWeek} avg kcal/day this week\n\nTrack your nutrition with MealSnap!`
  if (navigator.share) {
    navigator.share({ title: 'My MealSnap Stats', text })
  } else {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }
}

export function ProfileView({ user, streak, stats }: Props) {
  const router = useRouter()
  const isGuest = user.email.endsWith('@guest')

  const weightProgress = user.weightKg && user.goalWeightKg
    ? Math.min(100, Math.max(0, Math.abs(user.weightKg - user.goalWeightKg) > 0
        ? 100 - (Math.abs(user.weightKg - user.goalWeightKg) / Math.max(1, Math.abs(user.weightKg - user.goalWeightKg))) * 100
        : 100))
    : null

  async function handleExport() {
    const res = await fetch('/api/meals?export=1')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mealsnap-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="page-bottom" style={{ background: '#FAFAF7' }}>
      <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D1A', margin: 0 }}>Profile</h1>
        <button onClick={() => shareToday(user, stats, streak)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 999, border: 'none', background: '#E8F5E9',
          color: '#2E7D32', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span>↑</span> Share
        </button>
      </div>

      {/* Guest banner */}
      {isGuest && (
        <div style={{ margin: '0 16px 12px', padding: '14px 16px', borderRadius: 16, background: '#FFF8E1', border: '1px solid #FFE082', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5D4037' }}>Guest session</div>
            <div style={{ fontSize: 12, color: '#795548', marginTop: 2 }}>Data will be lost when you sign out.</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{
            padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: '#4CAF50', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          }}>Sign In</button>
        </div>
      )}

      {/* User card */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="avatar" width={64} height={64}
            style={{ borderRadius: '50%', border: '3px solid #E8F5E9', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff', fontWeight: 800, flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: 13, color: '#6B7168', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isGuest ? 'Guest user' : user.email}</div>
          {streak > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 20, padding: '3px 8px' }}>
              <span style={{ fontSize: 12 }}>🔥</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#F57F17' }}>{streak} day streak</span>
            </div>
          )}
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: user.isPro ? 'linear-gradient(135deg, #FFD700, #FF8F00)' : '#F5F5F0', color: user.isPro ? '#fff' : '#6B7168', flexShrink: 0 }}>
          {user.isPro ? '⭐ Pro' : 'Free'}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ margin: '0 16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Meals logged', value: stats.totalMeals.toLocaleString(), icon: '🍽️' },
          { label: 'Avg kcal/day', value: stats.avgKcalThisWeek > 0 ? stats.avgKcalThisWeek.toLocaleString() : '—', icon: '⚡' },
          { label: 'Active days', value: `${stats.activeDaysThisWeek}/7`, icon: '📅' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1D1A', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#9E9E9E', marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current stats */}
      {(user.weightKg || user.heightCm) && (
        <div className="card" style={{ margin: '0 16px 12px', padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7168', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Body Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Weight', value: user.weightKg ? `${user.weightKg} kg` : '—' },
              { label: 'Height', value: user.heightCm ? `${user.heightCm} cm` : '—' },
              { label: 'Daily goal', value: `${user.dailyGoalKcal.toLocaleString()} kcal` },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', background: '#F5F5F0', borderRadius: 12, padding: '10px 6px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#9E9E9E', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {user.weightKg && user.goalWeightKg && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7168', marginBottom: 6 }}>
                <span>Current: {user.weightKg} kg</span>
                <span>Goal: {user.goalWeightKg} kg</span>
              </div>
              <div style={{ height: 6, background: '#F0F0EC', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #4CAF50, #2E7D32)',
                  width: user.weightKg === user.goalWeightKg ? '100%' : `${Math.min(100, Math.max(5, 100 - Math.abs(user.weightKg - user.goalWeightKg) * 5))}%`,
                  transition: 'width 0.5s ease',
                }}/>
              </div>
              <div style={{ fontSize: 11, color: '#9E9E9E', marginTop: 4, textAlign: 'center' }}>
                {user.weightKg === user.goalWeightKg ? '🎯 Goal reached!' : `${Math.abs(user.weightKg - user.goalWeightKg).toFixed(1)} kg to go`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '0 16px' }}>
        {[
          { emoji: '👤', label: 'Edit Profile',      action: () => router.push('/settings/profile') },
          { emoji: '🎯', label: 'Goals',              action: () => router.push('/goals') },
          { emoji: '📈', label: 'Progress',           action: () => router.push('/progress') },
          { emoji: '🥗', label: 'Nutrition Details',  action: () => router.push('/nutrition') },
          { emoji: '⚙️', label: 'Settings',           action: () => router.push('/settings') },
        ].map((item, i) => (
          <button key={item.label} onClick={item.action} style={{
            width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none', textAlign: 'left',
          }}>
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1D1A', flex: 1 }}>{item.label}</span>
            <span style={{ color: '#C0C0C0' }}>›</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="card" style={{ margin: '0 16px 12px', padding: '0 16px' }}>
        {[
          { emoji: '📤', label: 'Export Data (JSON)', action: handleExport, color: '#1A1D1A' },
          { emoji: '🚪', label: 'Sign Out',           action: () => signOut({ callbackUrl: '/login' }), color: '#F44336' },
        ].map((item, i) => (
          <button key={item.label} onClick={item.action} style={{
            width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none', textAlign: 'left',
          }}>
            <span style={{ fontSize: 20 }}>{item.emoji}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: item.color }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Pro banner */}
      {!user.isPro && (
        <div style={{ margin: '0 16px 24px', padding: '20px', borderRadius: 20, background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>⭐</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Upgrade to Pro</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '4px 0 12px' }}>Unlimited AI scans · Advanced stats · Cloud backup</div>
          <button style={{ background: '#fff', color: '#2E7D32', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            $4.99/month →
          </button>
        </div>
      )}


    </div>
  )
}
