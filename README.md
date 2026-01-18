# WanderNest

**GPS-powered exploration for hospitality properties.**

Give your guests something to discover. WanderNest provides embeddable, interactive maps that unlock rich content as guests explore your grounds.

## How It Works

1. **See Your Map** — All the places worth discovering, at a glance
2. **Wander Freely** — Explore at your own pace with GPS guidance
3. **Unlock Stories** — Audio, video, and details reveal as you approach

## For Properties

- Create hotspots with rich content (images, audio guides, descriptions)
- Upload custom illustrated maps that overlay on satellite imagery
- Customize marker styles and map boundaries
- Share via simple access codes, QR codes, or embed in your app
- Mobile QR flow for adding hotspots on-location

## For Guests

- Explore at your own pace
- Discover content automatically when nearby (within 10m)
- Works offline in remote locations
- No app download required — works in any browser
- Privacy-first: location data never leaves your device

## Key Features

| Feature | Description |
|---------|-------------|
| GPS Proximity Triggers | Content reveals automatically within 10m |
| Rich Media Hotspots | Images, audio guides, video, detailed descriptions |
| Two Experience Modes | Full (tap to discover) or Interactive (auto-trigger) |
| Offline Support | IndexedDB caching for areas with limited connectivity |
| Custom Map Overlays | Calibration support for illustrated property maps |
| Zero Friction | No app download, instant browser access |

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM
- **Maps:** Leaflet + React-Leaflet
- **Styling:** Tailwind CSS 4
- **State:** TanStack Query

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Push database schema
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Documentation

| Document | Description |
|----------|-------------|
| [PRODUCT.md](./PRODUCT.md) | Product overview, features, and vision |
| [TARGET_AUDIENCE.md](./TARGET_AUDIENCE.md) | User personas and market positioning |
| [docs/COPY_GUIDE.md](./docs/COPY_GUIDE.md) | Voice, tone, and terminology guidelines |
| [CLAUDE.md](./CLAUDE.md) | Technical implementation details for developers |
| [BRAND_NAME_OPTIONS.md](./BRAND_NAME_OPTIONS.md) | Brand naming rationale |

## Project Structure

```
src/
  app/
    page.tsx        # Landing page
    map/            # Guest-facing map experience
    portal/         # Property management dashboard
    api/            # API routes
  components/       # Shared UI components
  hooks/            # Custom React hooks
  lib/              # Utilities and database
```

## Demo

Use access code `DEMO` to explore the demo property, or click "Try the Demo" on the landing page.

## License

Proprietary
