# WanderNest

GPS-powered exploration platform for resorts and hospitality properties. Guests discover hotspots via interactive maps with proximity-triggered content.

**Website:** [wandernest.co.uk](https://wandernest.co.uk)

> **See also:** [PRODUCT.md](./PRODUCT.md) for product vision and features, [TARGET_AUDIENCE.md](./TARGET_AUDIENCE.md) for user personas and market positioning.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM
- **Maps:** Leaflet + leaflet-imageoverlay-rotated (for rotated custom maps)
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

**projects** - Resort configuration, slugs, map settings, venue location, custom map overlay settings
**hotspots** - Points of interest with location, media, marker styling

## Custom Map Calibration

Properties can overlay illustrated maps on top of the base map. Two calibration modes are supported:

### 2-Corner Mode (Default)
- For north-aligned rectangular maps
- User clicks top-left and bottom-right corners on both the image and satellite map
- Uses standard `L.imageOverlay` with simple bounding box
- Most stable and recommended for aligned maps

### 3-Corner Mode
- For rotated or skewed maps that aren't north-aligned
- User clicks top-left, top-right, and bottom-left corners
- 4th corner inferred mathematically: `BR = TR - TL + BL`
- Uses `leaflet-imageoverlay-rotated` package with CSS `matrix()` transform
- More stable than 4-point projective transforms at different zoom levels

### Key Files
- `src/components/map/custom-map/custom-map-calibrator.tsx` - Calibration UI with wizard
- `src/components/map/custom-map/calibration-preview.tsx` - Preview overlay alignment
- `src/components/map/leaflet-map.tsx` - Main map renderer with overlay support
- `src/lib/db/schema.ts` - `CalibrationMode` type (`'2corners' | '3corners' | 'gcps'`)

## Key Patterns

- Map components use `dynamic()` with `ssr: false`
- Access via slugs (no auth system) - verified by project lookup
- Smart location mocking when user >5km from venue
- IndexedDB caching for offline support
- Demo mode via "Try the Demo" button on landing page

## Performance Patterns

Following [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills):

- **Bundle optimization:** `optimizePackageImports` enabled for `lucide-react` in `next.config.ts`
- **Parallel async:** API routes use `Promise.all()` for independent operations (params + request.json)
- **Dynamic imports:** Heavy components (maps, calibrators) loaded with `next/dynamic` and `ssr: false`
- **Passive listeners:** Scroll event listeners use `{ passive: true }` for smoother scrolling
- **Data fetching:** TanStack Query handles caching, deduplication, and stale-while-revalidate

## Mobile Hotspot Creation (QR Flow)

Scan a QR code on your phone to add hotspots on location. Hotspots are submitted as drafts for review.

### Flow
1. Generate QR code from portal settings (with expiry: 1h/4h/24h/1 week)
2. Scan on phone → `/add/[code]?token=...`
3. GPS captured, enter title + take photo
4. Draft appears in portal "Pending Review" section
5. Review/publish from portal

### Key Files
- `src/app/add/[code]/` - Mobile hotspot creation page
- `src/app/api/tokens/` - Token generation and validation
- `src/app/portal/settings/page.tsx` - QR code generator section

### Security TODO (Low Priority)
> The current token-based auth is minimal. Eventually consider:
> - Rate limiting on token generation and draft creation
> - IP-based restrictions or device fingerprinting
> - Audit logging for draft submissions

## API Endpoints

- `GET/PATCH /api/projects/[id]` - Project CRUD
- `GET /api/projects/by-slug/[slug]` - Lookup by slug
- `GET/POST /api/projects/[id]/hotspots` - List/create hotspots (supports `?includeDrafts=true`)
- `GET/PATCH/DELETE /api/hotspots/[id]` - Hotspot CRUD
- `POST /api/tokens` - Generate add-hotspot token
- `GET/DELETE /api/tokens/[token]` - Validate or revoke token
- `POST /api/upload` - File upload (10MB max)

## Environment Variables

- `DATABASE_URL` - Neon PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob (auto-configured on Vercel)
