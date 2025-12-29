# UI Coding Standards

## Component Library

**ONLY use shadcn/ui components for all UI elements in this project.**

- No custom components should be created
- All UI must be built using shadcn/ui primitives
- If a component doesn't exist in shadcn/ui, compose it from existing shadcn/ui components

Install components as needed:
```bash
npx shadcn@latest add <component-name>
```

## Date Formatting

Use `date-fns` for all date formatting.

**Required format:** Ordinal day + abbreviated month + full year

Examples:
- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024

**Implementation:**
```typescript
import { format } from "date-fns";

// Use this format string for dates
format(date, "do MMM yyyy");
```
