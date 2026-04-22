# MealSnap — Business Requirements Specification (BRS)
**Version:** 1.0  
**Live URL:** https://mealsnapv2.vercel.app  
**GitHub:** https://github.com/Tyngjun123/mealsnapv2  
**Last Updated:** 2026-04-22

---

## 1. 项目概述

| 项目 | 详情 |
|------|------|
| 产品名称 | MealSnap |
| 核心价值 | 拍一张照片 → AI 识别食物 → 自动记录卡路里 |
| 目标用户 | 关注健康饮食、想追踪卡路里的个人用户 |
| 商业模式 | Freemium（免费 + Pro 订阅 $4.99/月） |
| 技术栈 | Next.js 15 · TypeScript · Tailwind CSS · Vercel |

---

## 2. 功能模块总览

| 模块 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|---------|---------|---------|---------|
| 用户系统 | 本地名字登录 | Google OAuth | 云端账号 | 多用户管理 |
| AI 识别 | Mock 假数据 | Gemini Flash | 同 Phase 2 | 识别次数限制 |
| 数据存储 | localStorage | localStorage | Vercel Postgres | 同 Phase 3 |
| 云端同步 | ❌ | ❌ | ✅ | ✅ |
| 订阅收费 | ❌ | ❌ | ❌ | ✅ Stripe |
| 部署 | Vercel（无 env） | Vercel + env vars | Vercel + DB | Vercel + DB + Stripe |

---

## 3. 各阶段详细需求

---

### Phase 1 — MVP UI（已完成 ✅）
**目标：** 完整 UI 可用，零 API key，本地存储

#### 功能清单
- [x] 登录页：输入名字 + 设定每日卡路里目标
- [x] 主页 Dashboard：卡路里进度环、宏量素条、今日餐食列表
- [x] 相机页：拍照 / 选相册、选餐别（早/午/晚/零食）
- [x] AI 结果页：食物列表（可编辑名称/克重/卡路里）、确认保存
- [x] 历史页：7日 Calendar Strip、按日期分组、可删除
- [x] 统计页：4个摘要卡片、7日柱状图、宏量素分解
- [x] 个人页：编辑目标/身高/体重/年龄、导出 JSON、退出

#### API Keys 需求
```
无需任何 API key
```

#### 数据存储
```
localStorage（设备本地）
ms_profile  → 用户信息
ms_meals    → 所有餐食记录
```

#### 已知限制
- 换设备/清除浏览器 → 数据丢失
- AI 识别使用 Mock 假数据（Chicken + Rice + Broccoli）
- 无实名登录，无数据安全保障

---

### Phase 2 — AI 识别 + Google 登录
**目标：** 真实 AI 识别食物；用 Google 账号登录

#### 功能清单
- [ ] Gemini Flash API 识别真实食物照片
- [ ] Google OAuth 2.0 登录 / 登出
- [ ] 登录后自动创建本地用户档案
- [ ] 识别失败时 fallback 到 Mock 数据（不崩溃）
- [ ] 支持中文食物名称识别

#### 所需 API Keys

| Key | 获取地址 | 费用 |
|-----|---------|------|
| `GEMINI_API_KEY` | aistudio.google.com → Get API Key | 免费 1500次/天 |
| `GOOGLE_CLIENT_ID` | console.cloud.google.com → Credentials | 免费 |
| `GOOGLE_CLIENT_SECRET` | 同上 | 免费 |
| `NEXTAUTH_SECRET` | 自己生成（openssl rand -base64 32） | 免费 |
| `NEXTAUTH_URL` | 填入 https://mealsnapv2.vercel.app | — |

#### Vercel 环境变量设置
```
Dashboard → mealsnapv2 → Settings → Environment Variables

AI_PROVIDER          = gemini
GEMINI_API_KEY       = AIza-xxxx
GOOGLE_CLIENT_ID     = xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-xxxx
NEXTAUTH_SECRET      = （随机32字符）
NEXTAUTH_URL         = https://mealsnapv2.vercel.app
```

#### Google Console 设置
```
console.cloud.google.com
→ APIs & Services → OAuth consent screen → 填写 App 信息
→ Credentials → OAuth Client ID → Web Application
→ Authorized redirect URIs 加入：
  https://mealsnapv2.vercel.app/api/auth/callback/google
  http://localhost:3000/api/auth/callback/google
```

#### 代码改动（Claude Code 帮你做）
```
1. middleware.ts → 取消注释 NextAuth middleware
2. app/login/page.tsx → 恢复 Google 登录按钮
3. app/login/LoginButton.tsx → 已存在，直接启用
```

#### 月费估算（100 用户）
```
Gemini Flash API  = $0（免费额度足够）
Google OAuth      = $0（永久免费）
总计              = $0/月
```

---

### Phase 3 — 云端数据库 + 多设备同步
**目标：** 数据存 Vercel Postgres；换设备不丢失；支持多设备

#### 功能清单
- [ ] 用户数据存入 Vercel Postgres（PostgreSQL）
- [ ] 登录后自动从云端拉取历史记录
- [ ] 图片上传至 Vercel Blob（持久化存储）
- [ ] 离线优先：无网络时写 localStorage，联网后同步
- [ ] 数据导出（CSV / JSON）
- [ ] 账号删除（GDPR 合规）

#### 所需服务

| 服务 | 获取方式 | 费用 |
|------|---------|------|
| Vercel Postgres | Dashboard → Storage → Create → Postgres | 免费 (256MB) |
| Vercel Blob | Dashboard → Storage → Create → Blob | 免费 (1GB) |

#### Vercel 自动注入的环境变量（无需手动填）
```
连接数据库后 Vercel 自动加入：
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
BLOB_READ_WRITE_TOKEN
```

#### 需要手动加的环境变量
```
MIGRATION_SECRET = 任意字符串（保护数据库初始化接口）
```

#### 数据库 Schema
```sql
users        → id, google_id, email, name, avatar_url, daily_goal_kcal, height_cm, weight_kg, age, is_pro
meals        → id, user_id, meal_type, eaten_at, image_url, total_kcal
food_items   → id, meal_id, name, amount_g, kcal, protein_g, carbs_g, fat_g
```

#### 初始化数据库
```
部署后执行一次：
POST https://mealsnapv2.vercel.app/api/migrate
Headers: { "x-migration-secret": "你的MIGRATION_SECRET" }
```

#### 代码改动（Claude Code 帮你做）
```
1. app/page.tsx → 恢复 server component，读 DB
2. app/history/page.tsx → 恢复 server component
3. app/stats/page.tsx → 恢复 server component
4. app/profile/page.tsx → 恢复 server component
5. app/result/page.tsx → handleSave 改为 POST /api/meals
6. app/api/analyze/route.ts → 加 Vercel Blob 上传
```

#### 月费估算（100 用户）
```
Vercel Postgres (Free tier: 256MB)  = $0
Vercel Blob (Free tier: 1GB)        = $0
总计                                 = $0/月
```

---

### Phase 4 — 变现系统（Freemium + Stripe）
**目标：** 开始收费；Free 用户每天 3 次 AI 识别；Pro 无限制

#### 定价方案
```
Free   → 每天 3 次 AI 识别，30 天历史，基础统计
Pro    → $4.99/月 或 $39.99/年（省 33%）
         无限 AI 识别、无限历史、高级图表、云备份
```

#### 功能清单
- [ ] Stripe 订阅集成（月付 + 年付）
- [ ] 7天免费试用（Pro）
- [ ] 每天识别次数计数器（Free 用户限 3 次）
- [ ] Premium 功能 Gate（检查 is_pro 字段）
- [ ] Stripe Webhook 处理（订阅状态更新）
- [ ] 订阅管理页面（取消/续费）
- [ ] Upgrade 弹窗（Free 用户用完次数时触发）

#### 所需 API Keys

| Key | 获取地址 | 费用 |
|-----|---------|------|
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API Keys | 免费（按成交收 2.9%+$0.30） |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → 创建 endpoint | 免费 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 同上（公开 key） | 免费 |

#### Stripe 产品设置
```
dashboard.stripe.com → Products → Add Product
产品名：MealSnap Pro
价格 1：$4.99/month（recurring）→ 复制 Price ID
价格 2：$39.99/year（recurring）→ 复制 Price ID
```

#### 需要加的环境变量
```
STRIPE_SECRET_KEY                = sk_live_xxxx
STRIPE_WEBHOOK_SECRET            = whsec_xxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_xxxx
STRIPE_MONTHLY_PRICE_ID          = price_xxxx
STRIPE_YEARLY_PRICE_ID           = price_xxxx
```

#### Webhook Endpoint 设置
```
Stripe → Webhooks → Add Endpoint
URL: https://mealsnapv2.vercel.app/api/stripe/webhook
Events:
  customer.subscription.created
  customer.subscription.updated
  customer.subscription.deleted
  invoice.payment_succeeded
  invoice.payment_failed
```

#### 代码改动（Claude Code 帮你做）
```
1. app/api/stripe/checkout/route.ts → 创建 Checkout Session
2. app/api/stripe/webhook/route.ts  → 处理订阅状态变更
3. app/api/stripe/portal/route.ts   → 客户门户（取消订阅）
4. lib/db.ts → 更新 is_pro 字段
5. components/PaywallGate.tsx → 限制 Free 用户
6. app/profile/ProfileView.tsx → Upgrade 按钮
```

#### 月收入预测（100 用户，15% 转化率）

| 场景 | 付费用户 | 月收入 | 月成本 | 净利润 |
|------|---------|--------|--------|--------|
| 保守 (5%) | 5 人 | $25 | $0 | **+$25** |
| 普通 (15%) | 15 人 | $75 | $0 | **+$75** |
| 良好 (25%) | 25 人 | $125 | $0 | **+$125** |

> Phase 4 阶段成本仍为 $0（Vercel 免费额度 + Gemini 免费额度覆盖 100 用户）

---

## 4. 完整 API Keys 清单

### Phase 2 需要（必须）
| 变量名 | 来源 | 费用 |
|--------|------|------|
| `AI_PROVIDER=gemini` | — | — |
| `GEMINI_API_KEY` | aistudio.google.com | 免费 |
| `GOOGLE_CLIENT_ID` | console.cloud.google.com | 免费 |
| `GOOGLE_CLIENT_SECRET` | 同上 | 免费 |
| `NEXTAUTH_SECRET` | 自己生成 | 免费 |
| `NEXTAUTH_URL` | 填 Vercel 域名 | — |

### Phase 3 新增
| 变量名 | 来源 | 费用 |
|--------|------|------|
| `POSTGRES_URL` 等 | Vercel 自动注入 | 免费 |
| `BLOB_READ_WRITE_TOKEN` | Vercel 自动注入 | 免费 |
| `MIGRATION_SECRET` | 自己设定 | — |

### Phase 4 新增
| 变量名 | 来源 | 费用 |
|--------|------|------|
| `STRIPE_SECRET_KEY` | dashboard.stripe.com | 按成交收费 |
| `STRIPE_WEBHOOK_SECRET` | 同上 | 免费 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 同上 | 免费 |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe Products | — |
| `STRIPE_YEARLY_PRICE_ID` | Stripe Products | — |

---

## 5. 技术栈全览

| 层次 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 15.x |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 认证 | NextAuth.js | 4.x |
| 数据库 | Vercel Postgres (Neon/PostgreSQL) | — |
| 文件存储 | Vercel Blob | — |
| AI 识别 | Google Gemini Flash | 1.5 |
| 支付 | Stripe | — |
| 部署 | Vercel | — |
| 版本控制 | GitHub | — |

---

## 6. 开发时间线

| Phase | 功能 | 估计时间 | 状态 |
|-------|------|---------|------|
| Phase 1 | 完整 UI + localStorage | 完成 ✅ | Live |
| Phase 2 | Gemini AI + Google 登录 | 1–2 天 | 待开始 |
| Phase 3 | Vercel Postgres + 云端同步 | 2–3 天 | 待开始 |
| Phase 4 | Stripe 订阅变现 | 3–5 天 | 待开始 |

---

## 7. 月度成本预测

| 用户规模 | Phase 1–2 | Phase 3 | Phase 4（净利润） |
|---------|-----------|---------|-----------------|
| 100 用户 | $0/月 | $0/月 | +$25–$125/月 |
| 500 用户 | $0/月 | $25/月 | +$150–$600/月 |
| 1,000 用户 | $0/月 | $25/月 | +$350–$1,200/月 |
| 5,000 用户 | ~$50/月 | $100/月 | +$2,500–$6,000/月 |

> Gemini Flash 免费额度：1,500 次/天 ≈ 支撑约 500 用户的正常使用量

---

## 8. 数据安全与合规

| 项目 | Phase 1 | Phase 2+ |
|------|---------|---------|
| 数据位置 | 设备本地 | Vercel（美国/欧洲区） |
| 用户认证 | 无 | Google OAuth JWT |
| API 安全 | 无需 | NEXTAUTH_SECRET 签名 |
| 图片存储 | 仅本地预览 | Vercel Blob（加密存储） |
| 账号删除 | 清除 localStorage | DELETE /api/user（级联删除） |
| GDPR | 不适用 | 支持账号删除 + 数据导出 |

---

## 9. 下一步行动（优先级排序）

```
立即可做（今天）：
  □ 在 Vercel 加入 Phase 2 环境变量
  □ 获取 Gemini API Key（aistudio.google.com，5分钟）
  □ 创建 Google OAuth Client（console.cloud.google.com，10分钟）

本周：
  □ 完成 Phase 2 代码改动（告诉 Claude Code 帮你做）
  □ 测试真实 AI 食物识别
  □ 分享给 10 个朋友内测

下周：
  □ Phase 3：连接 Vercel Postgres
  □ 测试多设备同步
  □ 收集用户反馈

一个月内：
  □ Phase 4：Stripe 订阅
  □ 正式对外发布
  □ 开始收费
```
