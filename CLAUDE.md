# Wandernest

GPS-powered exploration platform for resorts and hospitality properties. Guests discover hotspots via interactive maps with proximity-triggered content.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM
- **Maps:** Leaflet + React-Leaflet
- **State:** TanStack Query for server state, Context for project state
- **Styling:** Tailwind CSS 4
- **UI:** Radix UI components
- **File Storage:** Vercel Blob

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run db:push    # Push schema to database
npm run db:studio  # Open Drizzle Studio
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── map/                  # Guest map experience
│   ├── embed/[code]/         # Embeddable iframe
│   ├── portal/               # Property management dashboard
│   │   ├── settings/         # Resort settings
│   │   └── hotspots/         # Hotspot CRUD
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # Shadcn-style components
│   ├── map/                  # Map components
│   ├── modals/               # Hotspot detail modals
│   ├── forms/                # Form components
│   └── providers/            # Context providers
├── hooks/                    # Custom hooks (geolocation, proximity)
└── lib/
    ├── db/schema.ts          # Database schema & types
    └── cache/indexeddb.ts    # Offline caching
```

## Database Schema

**projects** - Resort configuration, access codes, map settings, venue location
**hotspots** - Points of interest with location, media, marker styling

## Key Patterns

- Map components use `dynamic()` with `ssr: false`
- Access via codes (no auth system) - verified by project lookup
- Smart location mocking when user >5km from venue
- IndexedDB caching for offline support
- Demo mode with `DEMO` access code

## Performance Patterns

Following [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills):

- **Bundle optimization:** `optimizePackageImports` enabled for `lucide-react` in `next.config.ts`
- **Parallel async:** API routes use `Promise.all()` for independent operations (params + request.json)
- **Dynamic imports:** Heavy components (maps, calibrators) loaded with `next/dynamic` and `ssr: false`
- **Passive listeners:** Scroll event listeners use `{ passive: true }` for smoother scrolling
- **Data fetching:** TanStack Query handles caching, deduplication, and stale-while-revalidate

## API Endpoints

- `GET/PATCH /api/projects/[id]` - Project CRUD
- `GET /api/projects/by-code/[code]` - Lookup by access code
- `GET/POST /api/projects/[id]/hotspots` - List/create hotspots
- `GET/PATCH/DELETE /api/hotspots/[id]` - Hotspot CRUD
- `POST /api/upload` - File upload (10MB max)

## Environment Variables

- `DATABASE_URL` - Neon PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob (auto-configured on Vercel)
