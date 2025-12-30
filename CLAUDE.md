# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation First

**IMPORTANT:** Before generating any code, ALWAYS first check the `/docs` directory for relevant documentation. The docs contain project-specific patterns, conventions, and implementation guides that must be followed. Read the relevant docs file(s) before writing or modifying code.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md
- /docs/routing.md

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 project using the App Router with TypeScript and Tailwind CSS 4.

**Key files:**
- `app/layout.tsx` - Root layout with Geist font configuration
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles with Tailwind and CSS custom properties for theming

**Path alias:** `@/*` maps to the project root (e.g., `@/app/page`)
