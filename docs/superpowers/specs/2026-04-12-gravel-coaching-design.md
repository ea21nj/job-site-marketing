# Gravel Coaching Analytics MVP — Design Specification

**Date:** April 12, 2026  
**Author:** Erik Andersson  
**Status:** Ready for Implementation  
**Timeline:** 2-4 weeks (solo, spare time)

---

## 1. Product Overview

### Vision
A web app that helps fitness-conscious gravel commuters understand their gravel fitness trends by visualizing and analyzing their Strava ride history. Focus: exploration-first analytics (self-discovery), not prescriptive coaching.

### Target User
**The fitness-conscious gravel commuter** — someone mixing gravel and road riding who wants to know: "Is my gravel fitness improving?" and "When do I ride most?"

### Core Value Prop
Show users their ride data in ways Strava doesn't: elevation trends over time, ride frequency patterns, and consistency tracking. Let them discover their own insights.

### Success Metrics (MVP)
- 10+ users actively syncing Strava data
- >50% weekly return rate
- Positive feedback on insight discovery ("I didn't know I ride more on weekends!")

---

## 2. User Flow

### Onboarding
1. User lands on homepage
2. Sees headline: "Visualize your gravel fitness trends"
3. Prompted: "Paste your Strava API token"
4. Clicks "Sync My Rides" button
5. Backend fetches all historical rides from Strava
6. Redirected to dashboard

### Core Experience (Dashboard)
1. User sees quick stats (rides this month, elevation, distance)
2. Views elevation trend chart (last 12 weeks)
3. Explores ride frequency heatmap (which days/weeks they ride most)
4. Browses sortable ride list (distance, elevation, date)
5. Reads consistency insight ("You averaged 2.3 rides/week this month")
6. Can click any ride for details
7. Can manually re-sync or update token anytime

---

## 3. Design System

### Typography
- **Headlines:** Nunito 800–900, very rounded, high-energy weight
- **Body:** Nunito 400–600, unified family, warm & approachable

### Color Palette
- **Accent:** #FF7849 (Warm persimmon) — CTAs, selected states, key metrics
- **Foreground:** #1F1F1F (Dark text) — all body text
- **Surface 1:** #FFFFFF (White) — card backgrounds, clean spaces
- **Surface 2:** #FFF8F5 (Barely-there peach) — subtle dividers, faint backgrounds
- **Surface 3:** #FFE8DC (Soft peach) — hover states, button backgrounds

### Design Principles
- **Border radius:** 24px on cards, 99px on pills/buttons
- **Shadows:** Soft, subtle shadows; lift on hover
- **Borders:** 1.5px, soft peach (#FFE8DC)
- **Aesthetic:** Consumer apps (health, wellness, food, social). Warm & inviting. Zero intimidation.

---

## 4. Core Visualizations

### 1. Quick Stats Section
Four cards showing:
- Rides this month
- Elevation gained this month
- Total distance this month
- Rides this year (optional)

Each card: white background, soft peach border, persimmon accent on numbers.

### 2. Elevation Over Time (Line Chart)
- X-axis: Weeks (last 12 weeks)
- Y-axis: Total elevation (feet/meters)
- Line color: Persimmon (#FF7849)
- Grid background: Barely-there peach
- Hover state: Show exact values, lift effect

### 3. Ride Frequency Heatmap
- Calendar-style grid: rows = weeks, columns = days of week
- Color intensity: darker = more rides that week
- Color: Soft peach shades, darkest = persimmon
- Helps user see patterns (e.g., "I always ride weekends")

### 4. Recent Rides List
- Table or card grid, sortable by: date, distance, elevation, duration
- Each row shows: date, distance, elevation gain, duration
- Clickable to see ride details (route, pace, terrain if available)
- Pagination or infinite scroll for hundreds of rides

### 5. Consistency Insight (Text)
- Single paragraph: "You're most active on weekends — 68% of your rides are Saturday/Sunday. You averaged 2.3 rides/week this month vs. 1.8 last month (+28%)"
- Generated from ride data
- Updates automatically after sync

---

## 5. Technical Architecture

### Tech Stack
- **Frontend:** React (Next.js 16+ App Router, Server Components)
- **Backend:** Next.js API Routes
- **Database:** SQLite (MVP) → Vercel Postgres (scale)
- **Hosting:** Vercel
- **Data Source:** User-provided Strava API token
- **Styling:** Tailwind CSS (with custom color config)

### File Structure

```
/app
├── page.tsx                    # Landing page (token input)
├── dashboard/
│   ├── page.tsx               # Main dashboard (Server Component)
│   ├── layout.tsx             # Dashboard layout
│   └── components/
│       ├── StatsOverview.tsx   # Quick stats cards
│       ├── ElevationChart.tsx  # Weekly elevation line chart
│       ├── FrequencyHeatmap.tsx # Day-of-week heatmap
│       ├── RideList.tsx        # Sortable ride table
│       └── ConsistencyInsight.tsx # Pattern text
├── api/
│   ├── strava/
│   │   ├── sync.ts            # POST to fetch rides from Strava
│   │   └── webhook.ts         # Future: real-time sync
│   └── rides/
│       ├── route.ts           # GET rides (filtered/sorted)
│       └── [id]/route.ts      # GET single ride details
└── lib/
    ├── db.ts                  # SQLite client setup
    ├── strava.ts              # Strava API wrapper
    └── analysis.ts            # Calculations (elevation totals, frequency, insights)
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  strava_token TEXT NOT NULL,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rides table (denormalized from Strava)
CREATE TABLE rides (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  distance_km REAL,
  elevation_m INT,
  duration_seconds INT,
  activity_type TEXT,
  start_date DATETIME,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for fast queries
CREATE INDEX idx_rides_user_date ON rides(user_id, start_date DESC);
CREATE INDEX idx_rides_user_elevation ON rides(user_id, elevation_m DESC);
```

### API Routes

#### POST /api/strava/sync
- **Input:** `{ strava_token: string }`
- **Process:**
  1. Validate token against Strava API
  2. Fetch all historical rides (paginated)
  3. Store/update in SQLite
  4. Calculate quick stats
- **Output:** `{ success: true, rides_synced: 42, stats: { ... } }`
- **Error handling:** Invalid token, rate limit, Strava downtime

#### GET /api/rides?user_id=X&sort=elevation&period=month&limit=50
- **Input:** Query params for filtering/sorting
- **Process:** Fetch rides from SQLite, apply filters
- **Output:** `{ rides: [...], stats: { total_elevation_m, ride_count } }`
- **Caching:** Use `use cache` with 1-hour revalidation

#### GET /api/rides/[id]
- **Input:** Ride ID
- **Output:** Full ride details (name, distance, elevation, duration, time, etc.)

### Caching Strategy (Next.js Cache Components)

**Static Content (CDN, instant):**
- Page shell (header, nav, footer)
- Landing page

**Cached Content (`use cache`, revalidate hourly):**
- Ride list + stats (Strava data doesn't change constantly)
- Dashboard visualizations
- User's consistency insight

```tsx
// Example: Cached ride fetch
async function RideData({ userId }: { userId: string }) {
  'use cache'
  cacheLife('hours')  // Revalidate hourly
  cacheTag(`rides-${userId}`)
  
  const data = await fetch(`/api/rides?user_id=${userId}`)
  return data
}
```

**Dynamic Content (Suspense, always fresh):**
- Token input form (user-specific state)
- Manual sync button action

### Data Flow

```
User enters token
    ↓
POST /api/strava/sync
    ↓
Validate token + fetch Strava API
    ↓
Parse rides (extract elevation, date, duration)
    ↓
Insert/update SQLite
    ↓
Redirect to /dashboard
    ↓
Dashboard Server Component renders
    ↓
Fetch /api/rides (cached for 1 hour)
    ↓
Render visualization components
    ↓
User sees charts, heatmap, ride list
```

---

## 6. Key Features & Behavior

### Token Management
- User pastes Strava API token on landing page
- Token stored encrypted in SQLite
- User can update/revoke token anytime via dashboard settings
- No OAuth complexity — user controls their data

### Initial Sync
- First sync fetches all historical rides (can be slow for 500+ rides)
- Show progress indicator ("Syncing 127 rides...")
- Handle pagination (Strava limits to 30 rides per request)

### Incremental Sync
- Manual "Re-sync" button on dashboard (fetches recent rides only)
- Future: scheduled background sync (daily/weekly)

### Error Handling
- **Invalid token:** Clear message, prompt re-entry
- **Rate limit (API 429):** "Strava temporarily rate-limited. Please try again in 15 minutes."
- **Strava API down:** "Strava is temporarily unavailable."
- **Empty ride history:** Onboarding message ("Start logging rides on Strava, then come back!")
- **Calculation errors:** Fall back to raw data (don't break the UI)

### Accessibility
- Semantic HTML (header, nav, main, article)
- Color contrast: persimmon on white meets WCAG AA
- Chart tooltips: keyboard accessible, screen-reader friendly
- Mobile-responsive: 320px to 2560px

---

## 7. Database & Deployment

### Database: SQLite (MVP) → PostgreSQL (Scale)

**MVP (now):**
- SQLite file stored on Vercel filesystem
- Zero ops overhead
- Simple, works for single-user testing
- Easy local development

**Growth (later):**
- Migrate to Vercel Postgres (managed, free tier available)
- Same schema, just swap driver (`better-sqlite3` → `pg`)
- Scales to thousands of users

**Decision:** Start with SQLite. If you get traction, migrate in a weekend. No architectural blocker.

### Hosting: Vercel

- **Build:** `next build` on every push
- **Preview:** Auto-preview deploys on PRs
- **Production:** Main branch auto-deploys
- **Environment:** `STRAVA_API_SECRET` (future, if needed)
- **Limits:** Free tier covers MVP (5 concurrent functions, regional compute)

### Environment Variables

```
# Local (.env.local)
STRAVA_API_TOKEN_SAMPLE="xxxx"  # For testing

# Vercel Production
DATABASE_URL="file:./data.db"   # SQLite path
STRAVA_API_SECRET=""            # Future OAuth
```

---

## 8. MVP Scope

### Must-Have (Launch)
- ✅ Landing page with token input
- ✅ POST /api/strava/sync (fetch + store rides)
- ✅ Dashboard page
- ✅ StatsOverview component (4 cards)
- ✅ ElevationChart (line chart, last 12 weeks)
- ✅ FrequencyHeatmap (day-of-week grid)
- ✅ RideList (sortable table)
- ✅ ConsistencyInsight (text paragraph)
- ✅ Error handling (invalid token, API failures)
- ✅ Responsive design (mobile + desktop)
- ✅ Deployed to Vercel

### Nice-to-Have (Post-Launch)
- 📱 PWA (offline view of cached data)
- 🏆 Social features (share achievements)
- 📊 Advanced analytics (power, cadence, terrain if available)
- 🎯 Training plans / coaching recommendations
- 💰 Premium tier (advanced insights, export)
- 🔔 Email digest ("Your weekly summary")
- 📈 Year-over-year comparison

### Out of Scope (MVP)
- Mobile app (web-only for now)
- Real-time sync (manual re-sync button)
- Leaderboards
- Social comparison
- Integration with other fitness apps (Garmin, Wahoo)

---

## 9. Testing & QA

### Manual Testing (MVP)
- [ ] Token input: valid token syncs rides, invalid token shows error
- [ ] Sync: 100 rides, 500 rides — ensure pagination works
- [ ] Dashboard: renders all 4 visualizations without crashes
- [ ] Charts: hover tooltips appear, responsive on mobile
- [ ] Sorting: ride list sorts by elevation, distance, date
- [ ] Error states: network down, rate limited, empty data

### Automated Testing
- Unit tests for analysis functions (elevation total, frequency calc)
- Integration tests for /api/strava/sync and /api/rides
- E2E test: token input → sync → dashboard loads (Playwright)

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile: iOS Safari, Chrome Android

---

## 10. Success & Next Steps

### Launch Checklist
- [ ] All Must-Have features complete
- [ ] 3 beta testers (real gravel commuters) test & give feedback
- [ ] Deployed to Vercel, custom domain
- [ ] GitHub repo public (open-source or private, your call)
- [ ] Share with gravel cycling communities (Reddit r/gravel, Strava clubs)

### Post-Launch (If You Get Traction)
- Add Nice-to-Have features based on user feedback
- Set up analytics (what visualizations do users spend time on?)
- Plan premium tier (if revenue is goal)

---

## Summary

This is a **lightweight, exploration-focused analytics dashboard** for gravel cyclists. Build fast, deploy to Vercel, get real users, iterate. No complex auth, no mobile app, no backend ops — just solid React + Next.js + SQLite.

**Timeline:** 2–4 weeks, solo. **Cost:** $0 (Vercel free tier covers MVP). **Risk:** Low (simple architecture, straightforward data pipeline).
