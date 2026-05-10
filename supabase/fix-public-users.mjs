import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

// Check public.users
const { rows: pubUsers } = await client.query(`SELECT id, email, name FROM public.users`)
console.log('public.users rows:', pubUsers)

// Get auth users
const { rows: authUsers } = await client.query(`
  SELECT id, email, raw_user_meta_data->>'name' as name
  FROM auth.users
  WHERE email IN ('admin@traveloop.com','abhi@traveloop.com')
`)

// Insert missing ones
for (const u of authUsers) {
  const exists = pubUsers.find(p => p.id === u.id)
  if (!exists) {
    await client.query(`
      INSERT INTO public.users (id, email, name, language, currency)
      VALUES ($1, $2, $3, 'en', 'INR')
      ON CONFLICT (id) DO NOTHING
    `, [u.id, u.email, u.name ?? (u.email === 'admin@traveloop.com' ? 'Admin' : 'Abhijeet')])
    console.log('inserted public.users:', u.email)
  } else {
    console.log('already in public.users:', u.email)
  }
}

await client.end()
console.log('Done.')
