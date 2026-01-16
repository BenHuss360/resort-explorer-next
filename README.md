# Wandernest

A GPS-powered exploration tool for wellness, adventure, and luxury properties. Give your guests a better way to discover your grounds.

## What is Wandernest?

Wandernest provides embeddable, interactive maps that properties share with their guests. As guests roam the property, they discover points of interest through GPS-triggered content.

**For properties:**
- Create hotspots with rich content (images, audio guides, descriptions)
- Customize marker styles and map boundaries
- Choose between tap-to-discover or proximity-triggered modes
- Share via simple access codes

**For guests:**
- Explore at your own pace
- Discover content automatically when nearby (within 10m)
- Works offline in remote locations
- Mobile-first, intuitive interface

## Features

- GPS-based proximity triggers
- Rich media hotspots (images, audio)
- Two experience modes: Full (tap) and Interactive (auto-trigger)
- Offline support via IndexedDB
- Custom map overlays with calibration support
- Access code authentication

## Custom Map Overlays

Properties can upload illustrated maps that overlay on top of the base map:

- **2-Corner Mode:** For north-aligned rectangular maps. Click top-left and bottom-right corners.
- **3-Corner Mode:** For rotated/skewed maps. Click top-left, top-right, and bottom-left corners.

The system uses Leaflet's ImageOverlay (2-corner) or ImageOverlay.Rotated (3-corner) for stable rendering at all zoom levels.

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Database:** PostgreSQL (Neon) with Drizzle ORM
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

## Project Structure

```
src/
  app/
    map/        # Guest-facing map experience
    portal/     # Property management dashboard
    api/        # API routes
  components/   # Shared UI components
  hooks/        # Custom React hooks
  lib/          # Utilities and database
```

## License

Proprietary
