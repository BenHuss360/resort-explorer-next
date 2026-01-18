# Landing Page Copy Review

An analysis of the landing page messaging, consistency, and suggested improvements.

---

## Current Copy Inventory

### Header
- Logo + **"WanderNest"**
- "Sign in" link

### Hero Section
- Mobile badge: "GPS Discovery"
- Mobile headline: "Stories Around Every Corner"
- CTA Badge (mobile): "Something to discover"
- CTA Badge (desktop): "Give your guests something to discover"

### How It Works Section
- Badge: "Simple & Intuitive"
- Headline: "How It Works"
- Subheadline: "GPS-powered discovery that unfolds naturally as you explore the property"
- Steps:
  1. **See Your Map** — "All the places worth discovering, at a glance"
  2. **Wander Freely** — "Explore at your own pace with GPS guidance"
  3. **Unlock Stories** — "Audio, video, and details reveal as you approach"

### Features Section
- **No App Download** — "Works in browser or integrates into your app"
- **Works Offline** — "Content cached for remote areas"
- **Privacy First** — "Location data never leaves your device"
- **Instant Access** — "Just open the link and start exploring"

### Properties CTA Section
- Headline: "Bring WanderNest to **Your Property**"
- Subheadline: "Transform how guests experience your resort, retreat, or hospitality property. GPS-powered exploration that works instantly — no app download required."
- Value props:
  - **Easy Setup** — "Upload your map, add hotspots"
  - **No App Required** — "Works in any browser"
  - **Embed Anywhere** — "QR codes, links, or iframe"
- CTAs: "Try the Demo", "Contact Us"

### Footer
- Logo + **"WanderNest"**
- "Where exploration meets discovery."

### Demo Hotspot Cards
- Label: "Discovery Spot"
- Example: "Hilltop Viewpoint", "Lakeside Pavilion"

---

## Strengths

1. **Consistent "GPS-powered" language** — Used in hero, How It Works, Properties CTA, and footer
2. **Discovery theme** — "Discover," "unlock," "explore" appear naturally throughout
3. **Clear value propositions** — No app download, works offline, privacy-first are repeated appropriately
4. **Guest-focused then property-focused** — Page flows from guest experience to property benefits
5. **Action-oriented steps** — "See," "Wander," "Unlock" are active verbs
6. **Premium aesthetic language** — "Stories," "unfolds naturally," "at your own pace"

---

## Issues Found

### 1. Brand Name Capitalization Inconsistency (FIXED)

**Problem:** "Wandernest" vs "WanderNest" was used inconsistently.

**Resolution:** Standardized on **"WanderNest"** (one word, CamelCase) across all files.

**Files updated:**
- `src/components/landing/landing-header.tsx`
- `src/components/landing/properties-cta.tsx`
- `src/app/page.tsx`

### 2. Mobile Hero Headline Could Be Stronger (FIXED)

**Was:** "Explore Every Corner"

**Issue:** Generic; didn't communicate the GPS/discovery angle or what makes WanderNest unique.

**Resolution:** Changed to "Stories Around Every Corner" — connects to the "Unlock Stories" step and feels more evocative.

### 3. Footer Tagline Is Generic (FIXED)

**Was:** "GPS-powered exploration for properties that care about guest experience."

**Issue:** "...that care about guest experience" was cliché and didn't add value.

**Resolution:** Changed to "Where exploration meets discovery." — concise, evocative, and captures the product essence.

### 4. "Spotty Signal" Is Informal (FIXED)

**Was:** "Content cached for spotty signal areas"

**Issue:** "Spotty" was casual; didn't match premium positioning.

**Resolution:** Changed to "Content cached for remote areas"

### 5. "Point of Interest" Label Is Functional But Cold (FIXED)

**Was:** Hotspot cards used "Point of Interest" as the category label.

**Issue:** Functional but lacked warmth.

**Resolution:** Changed to "Discovery Spot" — warmer and fits the discovery theme.

---

## Copy Consistency Check

| Theme | Usage | Status |
|-------|-------|--------|
| "GPS-powered" | Hero, How It Works, Properties CTA, Footer | Consistent |
| "No app download" | Features, Properties CTA | Consistent |
| "Discovery/discover" | Hero, How It Works, Properties CTA | Consistent |
| "Explore" | Hero, How It Works, Features | Consistent |
| "Property/properties" | Properties CTA, Footer | Consistent |
| "Guests" | Properties CTA, Footer | Consistent |

---

## Recommendations Summary

### High Priority
1. ~~**Fix brand name capitalization**~~ — DONE: Standardized on "WanderNest" everywhere

### Medium Priority
2. ~~**Update footer tagline**~~ — DONE: Changed to "Where exploration meets discovery."
3. ~~**Refine offline copy**~~ — DONE: Changed to "Content cached for remote areas"

### Low Priority (Optional)
4. ~~**Strengthen mobile hero**~~ — DONE: Changed to "Stories Around Every Corner"
5. ~~**Reconsider "Point of Interest" label**~~ — DONE: Changed to "Discovery Spot"

---

## Voice & Tone Guidelines (Inferred)

Based on the existing copy, the WanderNest voice is:

- **Inviting but not pushy** — "Explore at your own pace"
- **Premium but approachable** — Technical features explained simply
- **Active and dynamic** — Verbs like "discover," "unlock," "wander"
- **Guest-experience focused** — Even when talking to properties, the copy centers on what guests feel
- **Not corporate** — Avoids jargon, keeps sentences short

When writing new copy, maintain this voice.
