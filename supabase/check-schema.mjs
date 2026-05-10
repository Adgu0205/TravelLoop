import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const { rows } = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`)
console.log('Public tables:', rows.map(r => r.table_name))

const { rows: triggers } = await client.query(`
  SELECT trigger_name, event_object_table, action_statement
  FROM information_schema.triggers
  WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
`)
console.log('Triggers:', JSON.stringify(triggers, null, 2))

await client.end()
