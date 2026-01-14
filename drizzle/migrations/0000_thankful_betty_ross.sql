CREATE TABLE "hotspots" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"image_url" text,
	"audio_url" text,
	"marker_color" text DEFAULT '#3B82F6',
	"marker_type" text DEFAULT 'pin',
	"custom_marker_url" text,
	"optional_fields" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"resort_name" text NOT NULL,
	"access_code" varchar(10) NOT NULL,
	"homepage_content" text,
	"map_type" text DEFAULT 'openstreetmap' NOT NULL,
	"custom_map_url" text,
	"map_experience" text DEFAULT 'full' NOT NULL,
	"north_boundary" real,
	"south_boundary" real,
	"east_boundary" real,
	"west_boundary" real,
	"venue_location_lat" real,
	"venue_location_lng" real,
	"custom_map_image_url" text,
	"custom_map_north_lat" real,
	"custom_map_south_lat" real,
	"custom_map_west_lng" real,
	"custom_map_east_lng" real,
	"custom_map_opacity" real DEFAULT 0.8,
	"custom_map_enabled" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_access_code_unique" UNIQUE("access_code")
);
--> statement-breakpoint
ALTER TABLE "hotspots" ADD CONSTRAINT "hotspots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;