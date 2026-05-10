import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const { rows } = await client.query(`
  SELECT tablename, policyname, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname
`)

for (const r of rows) {
  console.log(`[${r.tablename}] ${r.policyname} (${r.cmd})`)
  console.log(`  USING: ${r.qual}`)
  if (r.with_check) console.log(`  CHECK: ${r.with_check}`)
}

await client.end()
