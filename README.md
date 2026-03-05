# FocusFlow - Meeting Notes & Action Tracker

FocusFlow is a clean and minimal productivity app for capturing meeting notes and tracking action items.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Prisma ORM
- SQLite
- Recharts

## Features

- Dashboard overview
  - Total meetings
  - Total tasks
  - Pending/completed task counts
  - Completion percentage
  - Weekly task completion chart
- Meetings management
  - Create, list, update, and delete meetings
  - Meeting details page with notes and linked action items
- Task management
  - Create, edit, delete tasks
  - Toggle task completion status
  - Filter tasks by status
  - Optimistic UI interactions
  - Undo windows for delete actions
- Analytics
  - Weekly task completion chart
  - Task completion rate visualization
  - Tasks-per-meeting chart

## Project Structure

```text
app/
	dashboard/
	meetings/
	meetings/[id]/
	tasks/
	analytics/
	api/meetings/
	api/meetings/[id]/
	api/tasks/
	api/tasks/[id]/

components/
	Navbar.tsx
	dashboard/
	meetings/
	tasks/
	charts/
	ui/

lib/
	prisma.ts
	dashboard.ts
	meetings.ts
	tasks.ts
	analytics.ts
	types.ts
	constants.ts
	client-events.ts

prisma/
	schema.prisma
	migrations/
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Apply Prisma migrations

```bash
npm run prisma:migrate
```

3. Seed demo data (optional)

```bash
npm run db:seed
```

4. Start development server

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint and type checks
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - create/apply local migrations
- `npm run prisma:deploy` - apply committed migrations (CI/production)
- `npm run prisma:studio` - open Prisma Studio
- `npm run db:seed` - reset and seed demo meetings/tasks
- `npm run db:reset` - reset DB, reapply migrations, and seed demo data
- `npm run api:smoke` - run automated API CRUD smoke checks (meetings/tasks)

## Vercel Notes

- The project is Vercel-compatible from a Next.js perspective.
- For Prisma, `postinstall` runs `prisma generate` automatically.
- SQLite is ideal for local/simple setups. For production-grade persistence on Vercel, use a hosted database and update `DATABASE_URL` accordingly.

## CI

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Runs on push and pull requests.
- Pipeline steps: `npm ci` -> `npm run lint` -> `npm run build` -> `npm run db:reset` -> `npm run api:smoke`
- Additional non-blocking security job: `npm audit --omit=dev --audit-level=high`

## Environment

`.env`

```env
DATABASE_URL="file:./dev.db"
```
