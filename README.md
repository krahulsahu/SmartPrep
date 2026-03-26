# SmartPrep AI

SmartPrep AI is now structured as a MongoDB-backed Next.js application with secure cookie-based authentication and two roles:

- `student`
- `admin`

Students can browse tests, take them, and review persisted results. Admins inherit student access and also manage questions, tests, analytics, and user listings.

## Stack

- Next.js 16
- React 19
- TypeScript
- MongoDB
- Tailwind CSS
- shadcn/ui

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=smartprep_ai
AUTH_SECRET=replace-with-a-long-random-secret
OPENAI_API_KEY=
```

## Install

```bash
npm install
```

If you prefer `pnpm`, reinstall dependencies with your local `pnpm` version to avoid store mismatch issues.

## Seed Local Data

The seed script migrates the legacy mock users into MongoDB as students and inserts starter questions/tests.

```bash
node scripts/seed.mjs
```

Admin accounts are not created through the UI. Create them manually in MongoDB and assign:

```json
{ "role": "admin" }
```

Generate a password hash for manual admin creation with:

```bash
node scripts/hash-password.mjs your-password
```

## Run

```bash
npm run dev
```

## Main Features

### Authentication

- Register stores users in MongoDB
- Login validates hashed passwords
- Session is stored in an HTTP-only signed cookie
- `/api/auth/me` restores auth state on the client

### Student

- Browse published tests
- Start a test and submit answers
- Save attempts, scores, and time spent to MongoDB
- Review detailed results
- View analytics based on persisted attempts

### Admin

- View admin dashboard and analytics
- List users
- Create questions manually
- Import question batches via JSON
- Generate AI questions and save them
- Create tests from stored questions

## API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET|POST /api/questions`
- `GET|PATCH|DELETE /api/questions/:id`
- `GET|POST /api/tests`
- `GET|PATCH|DELETE /api/tests/:id`
- `GET|POST /api/attempts`
- `GET /api/attempts/:id`
- `GET /api/analytics/performance`
- `GET /api/users`
- `POST /api/ai/generate-questions`
- `POST /api/ai/evaluate-answer`
- `POST /api/ai/generate-feedback`

## Notes

- Admin API access is enforced on the backend by role checks.
- Teacher routes and localStorage-based auth were removed.
- The AI service currently uses local fallback logic unless you wire a provider into `lib/ai-service.ts`.
