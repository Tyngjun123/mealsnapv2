import { Resend } from 'resend'

const FROM = 'MealSnap <notifications@mealsnap.app>'
function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

export async function sendDailyReminder(to: string, name: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: '🍽️ Don\'t forget to log your meals today!',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2E7D32;margin:0 0 8px">Hey ${name.split(' ')[0]} 👋</h2>
        <p style="color:#444;margin:0 0 16px">You haven't logged any meals today. Keep your streak going!</p>
        <a href="https://mealsnapv2.vercel.app" style="display:inline-block;background:#4CAF50;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700">
          Log a Meal →
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          You're receiving this because you use MealSnap.<br>
          <a href="https://mealsnapv2.vercel.app/profile" style="color:#999">Manage notifications</a>
        </p>
      </div>
    `,
  })
}

export async function sendWeeklySummary(to: string, name: string, stats: {
  avgKcal: number; goal: number; daysLogged: number; daysUnder: number; streak: number
}) {
  const pct = Math.round((stats.daysUnder / Math.max(stats.daysLogged, 1)) * 100)
  return getResend().emails.send({
    from: FROM,
    to,
    subject: '📊 Your MealSnap weekly summary',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#2E7D32;margin:0 0 4px">Weekly Summary</h2>
        <p style="color:#666;margin:0 0 24px;font-size:14px">Here's how you did this week, ${name.split(' ')[0]}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          ${[
            { label: 'Avg. Daily', value: `${stats.avgKcal.toLocaleString()} kcal`, color: '#4CAF50' },
            { label: 'Day Streak', value: `${stats.streak} days`, color: '#FF7043' },
            { label: 'Days Logged', value: `${stats.daysLogged} / 7`, color: '#1565C0' },
            { label: 'Under Goal', value: `${pct}%`, color: '#F9A825' },
          ].map(c => `
            <div style="background:#F5F5F0;border-radius:12px;padding:14px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:${c.color}">${c.value}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">${c.label}</div>
            </div>
          `).join('')}
        </div>
        <a href="https://mealsnapv2.vercel.app/stats" style="display:inline-block;background:#4CAF50;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700">
          View Full Stats →
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px">
          <a href="https://mealsnapv2.vercel.app/profile" style="color:#999">Manage notifications</a>
        </p>
      </div>
    `,
  })
}
