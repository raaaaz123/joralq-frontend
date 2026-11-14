# JoraIQ.AI frontend

Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS 4. Teacher and student UIs for JoraIQ.AI.

The browser only talks to Supabase for sign-up, sign-in and token refresh. Every quiz, assignment, submission and analytics call goes to the NestJS API in [joralq-backend](https://github.com/raaaaz123/joralq-backend), which has the full architecture, data model, API reference and database setup.

## Setup

Requirements: Node 22+, and the backend running (see its README).

```bash
cp .env.example .env.local   # fill in values, see below
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe in the browser: the tables are locked away from it) |
| `NEXT_PUBLIC_API_URL` | NestJS base URL, e.g. `http://localhost:4000` |

## Demo accounts

After `npm run seed` in the backend, the login page has one-click buttons for the demo teacher and student. Password for all demo accounts: `Demo@1234`.

| Role | Email |
|---|---|
| Teacher | `teacher@demo.jora` |
| Student | `student@demo.jora` |

## Pages

| Path | Who | What |
|---|---|---|
| `/login`, `/register` | anyone | Email + password auth; role picked at sign-up |
| `/teacher` | teacher | Own quizzes with completion and average accuracy |
| `/teacher/quizzes/new` | teacher | Create a multiple-choice quiz |
| `/teacher/quizzes/[id]` | teacher | Per-student analytics for one quiz |
| `/teacher/quizzes/[id]/assign` | teacher | Assign the quiz to students |
| `/teacher/quizzes/[id]/leaderboard` | teacher | Ranked results for the quiz |
| `/student` | student | Assigned quizzes, status and scores |
| `/student/quizzes/[id]` | student | Take the quiz (one submission) |
| `/student/quizzes/[id]/result` | student | Score and per-question review |
| `/student/quizzes/[id]/leaderboard` | student | Where you rank among finishers |
