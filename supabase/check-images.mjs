import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const { rows } = await client.query(`
  SELECT name, cover_image_url FROM public.cities ORDER BY name
`)

for (const r of rows) {
  console.log(`${r.name.padEnd(20)} | ${r.cover_image_url ?? 'NULL'}`)
}

await client.end()
