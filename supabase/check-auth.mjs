import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const { rows: users } = await client.query(`
  SELECT id, email, aud, role, email_confirmed_at, confirmed_at,
         encrypted_password IS NOT NULL as has_password,
         banned_until, deleted_at
  FROM auth.users WHERE email IN ('admin@traveloop.com','abhi@traveloop.com')
`)
console.log('auth.users:', JSON.stringify(users, null, 2))

const { rows: identities } = await client.query(`
  SELECT id, user_id, provider, provider_id, identity_data->>'email' as email
  FROM auth.identities WHERE provider = 'email'
  AND provider_id IN ('admin@traveloop.com','abhi@traveloop.com')
`)
console.log('auth.identities:', JSON.stringify(identities, null, 2))

await client.end()
