# Routing Standards

## Route Structure

**All application routes must be under `/dashboard`.**

The `/dashboard` route and all sub-routes are protected and only accessible to authenticated users.

```
/dashboard                    # Main dashboard (protected)
/dashboard/workout/new        # Create new workout (protected)
/dashboard/workout/[workoutId] # View/edit specific workout (protected)
```

## Route Protection

Route protection is handled by **Next.js middleware** using Clerk.

### Middleware Configuration

The middleware is configured in `src/middleware.ts`:

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### How Protection Works

1. Clerk middleware runs on all routes (except static files)
2. For `/dashboard/*` routes, unauthenticated users are automatically redirected to sign-in
3. No manual route protection logic should be added to page components

## Creating New Routes

When creating new routes:

1. **Always place under `/dashboard`** - Never create top-level routes for authenticated features
2. **Use the App Router structure** - Create folders in `src/app/dashboard/`
3. **Don't add manual auth checks in pages** - Middleware handles protection

### Route File Structure

```
src/app/dashboard/
├── page.tsx                    # /dashboard
├── _components/                # Shared dashboard components
├── workout/
│   ├── new/
│   │   └── page.tsx           # /dashboard/workout/new
│   ├── [workoutId]/
│   │   └── page.tsx           # /dashboard/workout/[workoutId]
│   └── _components/           # Workout-specific components
└── other-feature/
    └── page.tsx               # /dashboard/other-feature
```

## Dynamic Routes

Use Next.js dynamic route segments for resource-specific pages:

```typescript
// src/app/dashboard/workout/[workoutId]/page.tsx
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // Fetch and display workout
}
```

## Navigation

Use Next.js `Link` component for client-side navigation:

```typescript
import Link from "next/link";

<Link href="/dashboard">Dashboard</Link>
<Link href="/dashboard/workout/new">New Workout</Link>
<Link href={`/dashboard/workout/${workoutId}`}>View Workout</Link>
```

## Public Routes

The only public routes should be:

- `/` - Landing page (if applicable)
- `/sign-in` - Clerk sign-in page
- `/sign-up` - Clerk sign-up page

All other application functionality must be under `/dashboard`.

## Summary

| Rule | Implementation |
|------|----------------|
| Protected routes | All under `/dashboard` |
| Route protection | Next.js middleware with Clerk |
| Manual auth in pages | Not needed (middleware handles it) |
| New features | Create under `src/app/dashboard/` |
| Navigation | Use Next.js `Link` component |
