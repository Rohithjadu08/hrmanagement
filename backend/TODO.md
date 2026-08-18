# Backend Migration TODO (SQLite -> Supabase)

## Step 1: Plan confirmation
- [x] Confirm migration approach and RLS-based security

## Step 2: Supabase setup
- [x] Add `@supabase/supabase-js` to `backend/package.json`
- [x] Create `backend/config/supabaseClient.js`
- [x] Update env handling (`backend/.env.example`)

## Step 3: DB/auth migration
- [x] Add `employees` table + RLS SQL (to provide exact SQL)
- [x] Replace `backend/src/db/initDb.js` usage in code paths (auth + approvals)
- [x] Replace custom JWT/bcrypt auth with Supabase Auth in `backend/src/routes/authRoutes.js`
- [x] Remove obsolete auth code paths (`backend/src/auth/*`) or stop using them

## Step 4: HR workflow
- [x] Update `backend/src/services/approvalService.js` to use Supabase table
- [x] Update `backend/src/routes/hrRoutes.js` (keep same endpoints)
- [x] Update seed script `backend/src/seed.js` to create HR admin via Supabase Admin API

## Step 5: Verification
- [x] Local run and verify signup → pending → HR approve/decline → login end-to-end
- [x] Decide whether to remove old SQLite dependencies/files

