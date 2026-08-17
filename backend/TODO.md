# Backend Migration TODO (SQLite -> Supabase)

## Step 1: Plan confirmation
- [x] Confirm migration approach and RLS-based security

## Step 2: Supabase setup
- [ ] Add `@supabase/supabase-js` to `backend/package.json`
- [ ] Create `backend/config/supabaseClient.js`
- [ ] Update env handling (`backend/.env.example`)

## Step 3: DB/auth migration
- [ ] Add `employees` table + RLS SQL (to provide exact SQL)
- [ ] Replace `backend/src/db/initDb.js` usage in code paths (auth + approvals)
- [ ] Replace custom JWT/bcrypt auth with Supabase Auth in `backend/src/routes/authRoutes.js`
- [ ] Remove obsolete auth code paths (`backend/src/auth/*`) or stop using them

## Step 4: HR workflow
- [ ] Update `backend/src/services/approvalService.js` to use Supabase table
- [ ] Update `backend/src/routes/hrRoutes.js` (keep same endpoints)
- [ ] Update seed script `backend/src/seed.js` to create HR admin via Supabase Admin API

## Step 5: Verification
- [ ] Local run and verify signup → pending → HR approve/decline → login end-to-end
- [ ] Decide whether to remove old SQLite dependencies/files

