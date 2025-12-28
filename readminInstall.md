# LiftingDiaryCourse - Installation & Configuration Guide

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York style)
- **Database:** Neon PostgreSQL (serverless)
- **ORM:** Drizzle ORM
- **Authentication:** Clerk

---

## 1. Project Initialization

```bash
npx create-next-app@latest liftingdiarycourse
cd liftingdiarycourse
```

Options selected:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes

---

## 2. Install Dependencies

### Production Dependencies

```bash
npm install @clerk/nextjs @neondatabase/serverless drizzle-orm dotenv
npm install class-variance-authority clsx tailwind-merge lucide-react
```

### Dev Dependencies

```bash
npm install -D drizzle-kit tsx
```

---

## 3. shadcn/ui Setup

```bash
npx shadcn@latest init
```

Configuration (`components.json`):
- Style: new-york
- Base color: neutral
- CSS variables: Yes
- React Server Components: Yes
- Icon library: lucide

---

## 4. Neon Database Setup

### 4.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project named "LiftingDiaryCourse"
3. Copy the connection string

### 4.2 Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/neondb?sslmode=require
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 4.3 Drizzle Configuration

Create `drizzle.config.ts`:

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 4.4 Database Connection

Create `src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';

const db = drizzle(process.env.DATABASE_URL!);

export { db };
```

### 4.5 Database Schema

Create `src/db/schema.ts`:

```typescript
import { pgTable, serial, text, date, timestamp, integer, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Exercise library
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workout sessions
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  date: date('date').notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table: exercises performed in a workout
export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Individual sets
export const sets = pgTable('sets', {
  id: serial('id').primaryKey(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercises.id),
  setNumber: integer('set_number').notNull(),
  weight: real('weight').notNull(),
  reps: integer('reps').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations (see src/db/schema.ts for full implementation)
```

### 4.6 Push Schema to Database

```bash
npx drizzle-kit push
```

---

## 5. Clerk Authentication Setup

### 5.1 Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy the API keys to `.env`

### 5.2 Middleware

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

## 6. Seed Database (Optional)

A seed script is available at `src/db/seed.ts` to populate test data.

```bash
npx tsx src/db/seed.ts
```

This inserts:
- 10 exercises (Bench Press, Squat, Deadlift, etc.)
- 6 workouts
- 16 workout_exercises
- 47 sets

---

## 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
liftingdiarycourse/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── db/
│   │   ├── index.ts        # Database connection
│   │   ├── schema.ts       # Drizzle schema
│   │   └── seed.ts         # Seed script
│   └── middleware.ts       # Clerk auth middleware
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   └── utils.ts            # Utility functions (cn)
├── drizzle/                # Generated migrations
├── drizzle.config.ts
├── components.json         # shadcn/ui config
├── .env                    # Environment variables
└── package.json
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Push schema changes to database |
| `npx drizzle-kit studio` | Open Drizzle Studio GUI |
| `npx tsx src/db/seed.ts` | Seed database with test data |
