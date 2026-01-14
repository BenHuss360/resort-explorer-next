import { pgTable, text, serial, integer, boolean, real, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { z } from 'zod'

// ============================================
// DATABASE TABLES
// ============================================

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  resortName: text('resort_name').notNull(),
  accessCode: varchar('access_code', { length: 10 }).notNull().unique(),
  homepageContent: text('homepage_content'),
  mapType: text('map_type').notNull().default('openstreetmap'),
  customMapUrl: text('custom_map_url'),
  mapExperience: text('map_experience').notNull().default('full'),
  // Map boundaries
  northBoundary: real('north_boundary'),
  southBoundary: real('south_boundary'),
  eastBoundary: real('east_boundary'),
  westBoundary: real('west_boundary'),
  // Venue center location (used for mock mode when user is far from venue)
  venueLocationLat: real('venue_location_lat'),
  venueLocationLng: real('venue_location_lng'),
  // Custom map overlay
  customMapImageUrl: text('custom_map_image_url'),
  customMapNorthLat: real('custom_map_north_lat'),
  customMapSouthLat: real('custom_map_south_lat'),
  customMapWestLng: real('custom_map_west_lng'),
  customMapEastLng: real('custom_map_east_lng'),
  customMapOpacity: real('custom_map_opacity').default(0.8),
  customMapEnabled: boolean('custom_map_enabled').default(false),
  customMapGCPs: jsonb('custom_map_gcps').default([]),
  customMapCalibrationMode: text('custom_map_calibration_mode').default('corners'),
  // Meta
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const hotspots = pgTable('hotspots', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  imageUrl: text('image_url'),
  audioUrl: text('audio_url'),
  markerColor: text('marker_color').default('#3B82F6'),
  markerType: text('marker_type').default('pin'),
  customMarkerUrl: text('custom_marker_url'),
  optionalFields: jsonb('optional_fields').default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// ============================================
// RELATIONS
// ============================================

export const projectsRelations = relations(projects, ({ many }) => ({
  hotspots: many(hotspots),
}))

export const hotspotsRelations = relations(hotspots, ({ one }) => ({
  project: one(projects, {
    fields: [hotspots.projectId],
    references: [projects.id],
  }),
}))

// ============================================
// TYPES
// ============================================

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Hotspot = typeof hotspots.$inferSelect
export type NewHotspot = typeof hotspots.$inferInsert

export type OptionalField = {
  icon: string
  title: string
  subtitle: string
}

export type MapExperience = 'full' | 'interactive'

export type Boundaries = {
  north: number | null
  south: number | null
  east: number | null
  west: number | null
}

export type GroundControlPoint = {
  id: string
  imageX: number  // 0-1 normalized position on image
  imageY: number  // 0-1 normalized position on image
  latitude: number
  longitude: number
  label?: string
}

export type CalibrationMode = 'corners' | 'gcps'

export type CustomMapOverlay = {
  imageUrl: string | null
  northLat: number | null
  southLat: number | null
  westLng: number | null
  eastLng: number | null
  opacity: number
  enabled: boolean
  gcps: GroundControlPoint[]
  calibrationMode: CalibrationMode
}

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

export const optionalFieldSchema = z.object({
  icon: z.string(),
  title: z.string(),
  subtitle: z.string(),
})

export const hotspotSchema = z.object({
  projectId: z.number(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().url().optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  markerColor: z.string().default('#3B82F6'),
  markerType: z.enum(['pin', 'circle', 'star', 'diamond']).default('pin'),
  customMarkerUrl: z.string().url().optional().nullable(),
  optionalFields: z.array(optionalFieldSchema).default([]),
})

export const projectSchema = z.object({
  resortName: z.string().min(1, 'Resort name is required'),
  accessCode: z.string().min(1).max(10),
  homepageContent: z.string().optional().nullable(),
  mapExperience: z.enum(['full', 'interactive']).default('full'),
  northBoundary: z.number().optional().nullable(),
  southBoundary: z.number().optional().nullable(),
  eastBoundary: z.number().optional().nullable(),
  westBoundary: z.number().optional().nullable(),
})

export const groundControlPointSchema = z.object({
  id: z.string(),
  imageX: z.number().min(0).max(1),
  imageY: z.number().min(0).max(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  label: z.string().optional(),
})

export const customMapOverlaySchema = z.object({
  imageUrl: z.string().url().nullable(),
  northLat: z.number().min(-90).max(90).nullable(),
  southLat: z.number().min(-90).max(90).nullable(),
  westLng: z.number().min(-180).max(180).nullable(),
  eastLng: z.number().min(-180).max(180).nullable(),
  opacity: z.number().min(0).max(1).default(0.8),
  enabled: z.boolean().default(false),
  gcps: z.array(groundControlPointSchema).default([]),
  calibrationMode: z.enum(['corners', 'gcps']).default('corners'),
})
