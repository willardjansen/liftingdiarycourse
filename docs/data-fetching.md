# Data Fetching

## Core Principles

**ALL data fetching in this application MUST be done via Server Components.**

This is non-negotiable. Do not fetch data using:
- Route handlers (`app/api/*`)
- Client components (`"use client"`)
- `useEffect` or any client-side fetching hooks
- External API calls from the browser

## Database Queries

### Use Data Helper Functions

All database queries MUST be performed through helper functions located in the `/data` directory.

```typescript
// CORRECT - Use helper functions from /data
import { getWorkouts } from "@/data/workouts";

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}
```

```typescript
// WRONG - Do not query directly in components
import { db } from "@/db";

export default async function WorkoutsPage() {
  const workouts = await db.query.workouts.findMany(); // NO!
  return <WorkoutList workouts={workouts} />;
}
```

### Use Drizzle ORM Only

All database queries MUST use Drizzle ORM. **DO NOT USE RAW SQL.**

```typescript
// CORRECT - Use Drizzle ORM
export async function getWorkouts(userId: string) {
  return await db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
  });
}
```

```typescript
// WRONG - No raw SQL
export async function getWorkouts(userId: string) {
  return await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`); // NO!
}
```

## Security: User Data Isolation

**CRITICAL: A logged-in user can ONLY access their own data. They MUST NOT be able to access any other user's data.**

Every data helper function MUST:

1. Get the current user's ID from the session
2. Filter ALL queries by the user's ID
3. Never expose data belonging to other users

### Example Pattern

```typescript
// /data/workouts.ts
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkouts() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return await db.query.workouts.findMany({
    where: eq(workouts.userId, session.user.id),
  });
}

export async function getWorkoutById(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // ALWAYS filter by both the resource ID AND the user ID
  return await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, id),
      eq(workouts.userId, session.user.id)
    ),
  });
}
```

### Security Checklist

Before merging any data-fetching code, verify:

- [ ] Data is fetched in a Server Component
- [ ] Query uses a helper function from `/data`
- [ ] Helper function uses Drizzle ORM (no raw SQL)
- [ ] Helper function authenticates the user
- [ ] ALL queries are filtered by `userId`
- [ ] No data from other users can be accessed

## Summary

| Requirement | Rule |
|-------------|------|
| Where to fetch data | Server Components ONLY |
| Where to put queries | `/data` directory helper functions |
| ORM | Drizzle ORM (no raw SQL) |
| Security | Filter ALL queries by authenticated user's ID |
