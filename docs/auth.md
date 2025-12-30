# Authentication

## Authentication Provider

**This application uses [Clerk](https://clerk.com) for all authentication.**

Do not implement custom authentication logic. Use Clerk's built-in components and APIs exclusively.

## Server-Side Authentication

### Getting the Current User

Use Clerk's `auth()` function from `@clerk/nextjs/server` to get the current user's ID:

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();

if (!userId) {
  // User is not authenticated
  throw new Error("Unauthorized");
}
```

### Protecting Server Actions

ALL server actions that access or modify user data MUST:

1. Call `auth()` to get the current user
2. Verify `userId` exists before proceeding
3. Use `userId` to filter all database operations

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";

export async function myServerAction() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Proceed with authenticated logic using userId
}
```

### Protecting Data Helper Functions

ALL data helper functions in `/data` MUST authenticate the user:

```typescript
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/db";

export async function getUserData() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return await db.query.someTable.findMany({
    where: eq(someTable.clerkUserId, userId),
  });
}
```

## Database User ID Field

The database schema uses `clerkUserId` (not `userId`) to store the Clerk user ID:

```typescript
// In schema
clerkUserId: text("clerk_user_id").notNull();

// In queries
eq(workouts.clerkUserId, userId)
```

## Middleware

Clerk middleware is configured in `src/middleware.ts` to protect routes. The middleware runs on all routes except static files.

## Client-Side Components

For client components that need authentication UI, use Clerk's components:

- `<SignIn />` - Sign in form
- `<SignUp />` - Sign up form
- `<UserButton />` - User profile button
- `<SignedIn />` - Wrapper for authenticated content
- `<SignedOut />` - Wrapper for unauthenticated content

```typescript
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <a href="/sign-in">Sign In</a>
      </SignedOut>
    </header>
  );
}
```

## Security Checklist

Before merging any authentication-related code, verify:

- [ ] Server actions call `auth()` and check for `userId`
- [ ] Data helper functions call `auth()` and check for `userId`
- [ ] All database queries filter by `clerkUserId`
- [ ] No custom auth logic is implemented (use Clerk only)
- [ ] Protected routes are covered by middleware

## Summary

| Requirement | Rule |
|-------------|------|
| Auth provider | Clerk ONLY |
| Server-side auth | Use `auth()` from `@clerk/nextjs/server` |
| User ID field | `clerkUserId` in database schema |
| Data access | Always filter by authenticated user's `clerkUserId` |
| Client components | Use Clerk's React components |
