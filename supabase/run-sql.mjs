import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

async function run(file) {
  const sql = readFileSync(join(__dir, file), 'utf8')
  console.log(`Running ${file}...`)
  await client.query(sql)
  console.log(`✓ ${file} done`)
}

try {
  await client.connect()
  await run('schema.sql')
  await run('seed.sql')
  console.log('\n✅ Supabase DB ready')
} catch (err) {
  console.error('❌', err.message)
  process.exit(1)
} finally {
  await client.end()
}
