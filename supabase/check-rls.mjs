import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

// Check RLS status on all tables
const { rows: rls } = await client.query(`
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`)
console.log('RLS status:', rls)

// Check auth hooks
const { rows: hooks } = await client.query(`
  SELECT routine_name, routine_schema
  FROM information_schema.routines
  WHERE routine_name ILIKE '%hook%' OR routine_name ILIKE '%auth%'
`)
console.log('Auth-related functions:', hooks)

// Reload PostgREST schema cache
await client.query(`SELECT pg_notify('pgrst', 'reload schema')`)
console.log('Schema cache reloaded')

await client.end()
