import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
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
    // ignore
  }
}

loadEnv()

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient)

async function addUniqueConstraint() {
  console.log('Adding unique constraint to slug column...\n')

  try {
    // Check if constraint already exists
    const constraintCheck = await db.execute(sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'projects'
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%slug%'
    `)

    if (constraintCheck.rows.length > 0) {
      console.log('Unique constraint already exists:', constraintCheck.rows[0])
      return
    }

    // Add the unique constraint
    await db.execute(sql`
      ALTER TABLE projects
      ADD CONSTRAINT projects_slug_unique UNIQUE (slug)
    `)

    console.log('✓ Unique constraint added successfully!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addUniqueConstraint()
