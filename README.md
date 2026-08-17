# AI-Powered HR Management System

A full-stack AI-powered HR platform for employee management, task assignment, HR approvals, document-based knowledge retrieval and intelligent HR assistance.

## Features

### HR Management
- HR Dashboard
- Employee management
- Employee onboarding approvals
- Employee profiles

### Task Management
- Assign tasks to employees
- Task priorities and deadlines
- Task status workflow
- Employee "My Tasks"
- Task submissions with file attachments
- HR review & approval for task submissions
- Overdue task detection
- Task notifications

### AI Assistant
- HR AI Assistant
- Natural language questions
- RAG-powered answers
- HR policy retrieval
- Grounded responses

### RAG Knowledge Base
- HR document upload
- Document processing
- Text chunking & Embeddings
- Vector search via Supabase pgvector
- Context retrieval

### Authentication
- Role-based access (HR vs Employee)
- Supabase authentication
- RLS policies

### Notifications
- Task assignment notifications
- Task completion notifications
- HR Task Review feedback notifications

## Tech Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS

**Backend:**
- Node.js
- Express
- Langchain

**Database:**
- Supabase (PostgreSQL)
- pgvector
- Supabase Auth & Storage

**AI:**
- Google Gemini embeddings
- RAG

## Architecture
```
User -> Frontend -> Backend API -> Supabase (Auth, DB, Storage)
                                      |
                                  pgvector
                                      |
                                 RAG Retrieval -> AI LLM -> Response
```

## Installation Instructions

### 1. Clone
```bash
git clone <repository-url>
cd hrchatbotfinal
```

### 2. Install Dependencies
This project uses a combined workspace script. Install dependencies at the root:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. Environment Variables
Copy the `.env.example` templates to `.env` in both the `frontend` and `backend` directories.

In `frontend/`:
```bash
cp .env.example .env
```
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

In `backend/`:
```bash
cp .env.example .env
```
Fill in the Supabase URL, Service Role Key, and Google API Key.

### 4. Supabase Setup
1. Create a new Supabase project.
2. Ensure you have enabled the `vector` extension in the Supabase dashboard.
3. Run the SQL scripts found in `backend/supabase_schema.sql` and `backend/migrations/*.sql` in the Supabase SQL Editor to set up tables and storage buckets.

### 5. Running the Project
From the root directory, run the combined startup script:
```bash
npm run dev:combined
```
This will start both the backend on port 4000 and the frontend on port 5173 concurrently.

To build and run in production mode:
```bash
npm run start:combined
```
