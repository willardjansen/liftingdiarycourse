# Data Mutations

## Core Principles

**ALL data mutations in this application MUST be done via Server Actions.**

This is non-negotiable. Do not mutate data using:
- Route handlers (`app/api/*`)
- Client-side fetch calls
- Direct database calls in components

## Server Actions

### File Location

All server actions MUST be colocated with the feature they serve in files named `actions.ts`:

```
app/
├── dashboard/
│   ├── workouts/
│   │   ├── new/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts    ← Server actions for this feature
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── actions.ts    ← Server actions for this feature
```

### File Structure

Every `actions.ts` file MUST start with the `"use server"` directive:

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/db";
// ... other imports
```

### Parameter Types

**Server action parameters MUST be typed. DO NOT use `FormData` as a parameter type.**

```typescript
// CORRECT - Typed parameters
export async function createWorkout(date: string) {
  // ...
}

export async function addSet(
  workoutExerciseId: number,
  setNumber: number,
  weight: number,
  reps: number
) {
  // ...
}
```

```typescript
// WRONG - Do not use FormData
export async function createWorkout(formData: FormData) {  // NO!
  const date = formData.get("date");
  // ...
}
```

### Argument Validation with Zod

**ALL server actions MUST validate their arguments using Zod.**

```typescript
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export async function createWorkout(date: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Validate arguments
  const validated = createWorkoutSchema.parse({ date });

  // Proceed with validated data
  // ...
}
```

```typescript
const addSetSchema = z.object({
  workoutExerciseId: z.number().positive(),
  setNumber: z.number().positive(),
  weight: z.number().min(0),
  reps: z.number().positive(),
});

export async function addSet(
  workoutExerciseId: number,
  setNumber: number,
  weight: number,
  reps: number
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Validate all arguments
  const validated = addSetSchema.parse({
    workoutExerciseId,
    setNumber,
    weight,
    reps,
  });

  // Use validated.workoutExerciseId, validated.setNumber, etc.
  // ...
}
```

## Database Operations

### Use Data Helper Functions

All database mutations MUST be performed through helper functions located in the `/data` directory, which wrap Drizzle ORM calls.

```typescript
// /data/workouts.ts
import { db } from "@/src/db";
import { workouts } from "@/src/db/schema";

export async function insertWorkout(data: {
  clerkUserId: string;
  date: string;
  startedAt: Date;
}) {
  const [workout] = await db
    .insert(workouts)
    .values(data)
    .returning();

  return workout;
}
```

```typescript
// actions.ts - Use the helper function
"use server";

import { insertWorkout } from "@/data/workouts";

export async function createWorkout(date: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = createWorkoutSchema.parse({ date });

  return await insertWorkout({
    clerkUserId: userId,
    date: validated.date,
    startedAt: new Date(),
  });
}
```

### Use Drizzle ORM Only

All database mutations MUST use Drizzle ORM. **DO NOT USE RAW SQL.**

```typescript
// CORRECT - Use Drizzle ORM
await db.insert(workouts).values({ ... });
await db.update(workouts).set({ ... }).where(...);
await db.delete(workouts).where(...);
```

```typescript
// WRONG - No raw SQL
await db.execute(sql`INSERT INTO workouts ...`);  // NO!
```

## Security Requirements

Every server action that modifies user data MUST:

1. Authenticate the user with `auth()`
2. Verify the user owns the resource being modified
3. Filter all operations by `clerkUserId`

```typescript
export async function updateWorkout(workoutId: number, data: WorkoutUpdate) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // ALWAYS verify ownership before modifying
  await db
    .update(workouts)
    .set(data)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.clerkUserId, userId)  // Critical: filter by user
      )
    );
}
```

## Revalidation

After mutations that affect displayed data, use Next.js cache revalidation:

```typescript
import { revalidatePath } from "next/cache";

export async function completeWorkout(workoutId: number) {
  // ... perform mutation

  revalidatePath("/dashboard");
}
```

## Redirects

**DO NOT use `redirect()` within server actions.** Redirects must be handled client-side after the server action resolves.

```typescript
// WRONG - Do not redirect in server actions
export async function completeWorkout(workoutId: number, date: string) {
  // ... perform mutation
  redirect(`/dashboard?date=${date}`);  // NO!
}
```

```typescript
// CORRECT - Handle redirect client-side
// In actions.ts
export async function completeWorkout(workoutId: number) {
  // ... perform mutation
  revalidatePath("/dashboard");
  // Return data if needed, but no redirect
}

// In the client component
const handleComplete = async () => {
  await completeWorkout(workoutId);
  router.push(`/dashboard?date=${date}`);
};
```

## Security Checklist

Before merging any data mutation code, verify:

- [ ] Mutation is in a server action (`"use server"`)
- [ ] Action is in a colocated `actions.ts` file
- [ ] Parameters are typed (no `FormData`)
- [ ] Arguments are validated with Zod
- [ ] User is authenticated with `auth()`
- [ ] Database operations use Drizzle ORM (no raw SQL)
- [ ] All operations filter by `clerkUserId`
- [ ] Ownership is verified before updates/deletes
- [ ] No `redirect()` calls in server actions (handle client-side)

## Summary

| Requirement | Rule |
|-------------|------|
| Where to mutate data | Server Actions ONLY |
| Action file location | Colocated `actions.ts` files |
| Parameter types | Typed parameters (NO `FormData`) |
| Validation | Zod for ALL arguments |
| Database operations | Drizzle ORM via `/data` helper functions |
| Security | Authenticate user and filter by `clerkUserId` |
| Redirects | Client-side only (NO `redirect()` in server actions) |
