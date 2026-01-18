import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { projects } from '../src/lib/db/schema'
import { sql } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local')
    const envContent = readFileSync(envPath, 'utf8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  } catch (e) {
    // .env.local might not exist, that's ok if env vars are set elsewhere
  }
}

loadEnv()

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient)

/**
 * Convert an access code to a URL-friendly slug
 * - Converts to lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes any characters that aren't alphanumeric or hyphens
 * - Trims leading/trailing hyphens
 */
function toSlug(accessCode: string): string {
  return accessCode
    .toLowerCase()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters (except hyphens)
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
}

async function migrate() {
  console.log('Starting migration from access_code to slug...\n')

  try {
    // Check if the column needs to be renamed (access_code exists but slug doesn't)
    const columnCheck = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'projects'
      AND column_name IN ('access_code', 'slug')
    `)

    const columns = columnCheck.rows.map((r: { column_name: string }) => r.column_name)
    const hasAccessCode = columns.includes('access_code')
    const hasSlug = columns.includes('slug')

    console.log('Current columns:', columns)

    if (hasAccessCode && !hasSlug) {
      // Step 1: Rename the column from access_code to slug
      console.log('\n1. Renaming column access_code -> slug...')
      await db.execute(sql`ALTER TABLE projects RENAME COLUMN access_code TO slug`)
      console.log('   Column renamed successfully.')

      // Step 2: Alter the column length from 10 to 50
      console.log('\n2. Altering column length to 50...')
      await db.execute(sql`ALTER TABLE projects ALTER COLUMN slug TYPE VARCHAR(50)`)
      console.log('   Column length updated.')
    } else if (hasSlug) {
      console.log('\nColumn already named "slug". Skipping rename.')

      // Ensure length is 50
      console.log('\n2. Ensuring column length is 50...')
      await db.execute(sql`ALTER TABLE projects ALTER COLUMN slug TYPE VARCHAR(50)`)
      console.log('   Column length verified.')
    } else {
      console.error('ERROR: Neither access_code nor slug column found!')
      process.exit(1)
    }

    // Step 3: Fetch all projects and convert values to URL-friendly slugs
    console.log('\n3. Converting existing values to URL-friendly slugs...')

    const existingProjects = await db.select({
      id: projects.id,
      slug: projects.slug,
      resortName: projects.resortName,
    }).from(projects)

    if (existingProjects.length === 0) {
      console.log('   No projects found to migrate.')
    } else {
      for (const project of existingProjects) {
        const oldValue = project.slug
        const newSlug = toSlug(oldValue)

        if (oldValue !== newSlug) {
          await db.execute(
            sql`UPDATE projects SET slug = ${newSlug} WHERE id = ${project.id}`
          )
          console.log(`   [${project.id}] ${project.resortName}: "${oldValue}" -> "${newSlug}"`)
        } else {
          console.log(`   [${project.id}] ${project.resortName}: "${oldValue}" (no change needed)`)
        }
      }
    }

    console.log('\n✓ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run "npm run db:push" to sync any remaining schema changes')
    console.log('2. Test the application to ensure everything works')

  } catch (error) {
    console.error('\nMigration failed:', error)
    process.exit(1)
  }
}

migrate()
