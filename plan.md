# Water Tracker App - Implementation Plan

## Project Overview
Water Tracker app built with Expo + React Native + Supabase for auth and database.

## Architecture

### Tech Stack
- **Frontend**: Expo (React Native)
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Environment**: .env file with `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## Database Schema

### 1. **profiles** (extends Supabase auth.users)
```sql
- id (UUID, FK to auth.users)
- email (text)
- daily_goal (integer) -- in ml, default 2000ml
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. **water_entries** (track individual water consumption)
```sql
- id (UUID, primary key)
- user_id (UUID, FK to profiles.id)
- amount (integer) -- ml consumed
- consumed_at (timestamp) -- when water was consumed
- created_at (timestamp)
```

### 3. **daily_stats** (optional, for faster queries)
```sql
- id (UUID, primary key)
- user_id (UUID, FK to profiles.id)
- date (date) -- the day
- total_amount (integer) -- total ml for that day
- goal (integer) -- daily goal on that day
- created_at (timestamp)
```

---

## UI Structure (3 Pages)

### 1. **Add Water Page** (Tracking)
- Quick add button with preset amounts (250ml, 500ml, 750ml, 1000ml)
- Custom amount input
- Timestamp picker (optional)
- Show today's progress toward daily goal (e.g., 1500/2000ml)
- Bottom action bar with large **+** button

### 2. **Statistics Page** (Dashboard)
- Today's total consumption vs goal
- Visual progress bar
- Last 7 days breakdown (chart or list)
- Last 30 days summary
- All-time stats
- Daily entries list for selected day

### 3. **Profile Page** (Settings)
- User email display
- Daily goal adjustment
- Account info
- Logout button

---

## Authentication Flow

### Registration
- Email + Password
- No email verification required
- Auto-create profile entry
- Redirect to Add Water page

### Login
- Email + Password
- Redirect to Add Water page (or continue from where user left)

### Logout
- Clear session
- Redirect to login

---

## Implementation Phases

### Phase 1: Setup
- [ ] Install Supabase client library
- [ ] Setup environment variables (.env)
- [ ] Create authentication context/hooks
- [ ] Create Supabase client instance

### Phase 2: Database
- [ ] Create tables in Supabase
- [ ] Setup RLS (Row Level Security) policies
- [ ] Test queries

### Phase 3: Authentication
- [ ] Build login screen
- [ ] Build register screen
- [ ] Test auth flow

### Phase 4: Features
- [ ] Build Add Water page
- [ ] Build Statistics page
- [ ] Build Profile page
- [ ] Test data flow

### Phase 5: Polish
- [ ] Styling/Theming
- [ ] Error handling
- [ ] Loading states
- [ ] Testing

---

## Final Decisions ✓

1. **Water unit**: 1 glass = 250ml
2. **Daily goal**: Configurable from profile, default 2L (2000ml)
3. **Statistics**: Today only
4. **Entry logging**: Yes, with timestamp
5. **Profile features**: View name/email, logout, edit daily goal, view stats
6. **Reminders**: Yes - notify user daily progress in cups remaining (e.g., "4 cups left today"). Keep reminding until 2L reached.
7. **Water entries**: Can add AND remove (delete)
8. **Visual feedback**: Include animations & progress circles

---

## Reminders Logic
- Daily goal: 2000ml default (8 glasses × 250ml)
- Track progress: X cups drunk, Y cups remaining
- Remind user periodically throughout the day
- Stop reminding once daily goal is reached
- Reset at midnight (based on user's timezone)

---

## Implementation Priority

### Phase 1: Setup & Auth ⚡
- [ ] Install Supabase package
- [ ] Create Supabase client
- [ ] Create auth context
- [ ] Build login screen
- [ ] Build register screen

### Phase 2: Database 🗄️
- [ ] Create `profiles` table
- [ ] Create `water_entries` table
- [ ] Setup RLS policies

### Phase 3: Pages 📱
- [ ] Add Water page (with +, presets, custom input)
- [ ] Statistics page (today's progress, reminders)
- [ ] Profile page (view name/email, edit goal, logout)

### Phase 4: Features 🔧
- [ ] Fetch & display data
- [ ] Add water entries
- [ ] Delete water entries
- [ ] Configure daily goal
- [ ] Show cups remaining
- [ ] Animations & progress circles

### Phase 5: Reminders & Polish 🎨
- [ ] Setup push notifications
- [ ] Daily reminder logic
- [ ] Error handling
- [ ] Loading states
