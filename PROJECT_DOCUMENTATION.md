# SmartPrep AI Documentation

## Current Architecture

SmartPrep AI is a Next.js application backed by MongoDB with secure HTTP-only cookie sessions.

Roles:

- `student`
- `admin`

Role behavior:

- Students can access the student dashboard only.
- Admins can access both student flows and admin management flows.
- Admin users are created manually in MongoDB.

## Persistence Model

Collections:

- `users`
- `questions`
- `tests`
- `attempts`

Core relationships:

- Tests store `questionIds`
- Attempts store `testId` and `userId`
- Questions and tests record `createdBy`

## Authentication

Auth flow is implemented through real API routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Implementation details:

- Passwords are hashed before storage
- Sessions are stored in signed HTTP-only cookies
- Client auth state is restored by calling `/api/auth/me`
- Signup always creates `student` users
- There is no admin signup flow in the UI

## Student Functionality

Routes:

- `/dashboard/student`
- `/dashboard/student/practice`
- `/dashboard/student/tests`
- `/dashboard/student/tests/[id]`
- `/dashboard/student/results/[id]`
- `/dashboard/student/analytics`

Implemented behavior:

- Load published tests from MongoDB
- Start tests and submit answers
- Persist attempts with score and time taken
- Review saved results
- View analytics computed from stored attempts

## Admin Functionality

Routes:

- `/dashboard/admin`
- `/dashboard/admin/questions`
- `/dashboard/admin/tests`
- `/dashboard/admin/users`
- `/dashboard/admin/content`
- `/dashboard/admin/analytics`

Implemented behavior:

- View system summary
- Create questions manually
- Import questions with JSON
- Generate questions through the AI route
- Create tests from stored questions
- View users
- View platform analytics

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Questions

- `GET /api/questions`
- `POST /api/questions`
- `GET /api/questions/[id]`
- `PATCH /api/questions/[id]`
- `DELETE /api/questions/[id]`

### Tests

- `GET /api/tests`
- `POST /api/tests`
- `GET /api/tests/[id]`
- `PATCH /api/tests/[id]`
- `DELETE /api/tests/[id]`

### Attempts

- `GET /api/attempts`
- `POST /api/attempts`
- `GET /api/attempts/[id]`

### Analytics

- `GET /api/analytics/performance`

### Users

- `GET /api/users`

### AI

- `POST /api/ai/generate-questions`
- `POST /api/ai/evaluate-answer`
- `POST /api/ai/generate-feedback`

## Environment Variables

Required variables:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `AUTH_SECRET`
- `OPENAI_API_KEY`

No secrets should be hardcoded in source files.

## Seed and Migration

The local seed script is:

- `scripts/seed.mjs`

It:

- migrates the legacy sample users into MongoDB as students
- inserts starter questions
- inserts a starter published test

Admin users must still be created manually in MongoDB.

To create a manual admin password hash, use:

- `node scripts/hash-password.mjs <password>`

## Removed From The Old Prototype

- localStorage authentication
- in-memory mock data file
- teacher role
- teacher dashboard routes
- fake persistence during test submission

## Remaining Follow-Up Work

- connect `lib/ai-service.ts` to a real external provider if required
- add richer admin user management actions
- add edit/delete UI flows for questions and tests
- add stronger server-side route guards for page-level access if desired
