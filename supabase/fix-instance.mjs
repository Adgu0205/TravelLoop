import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

// Check what a working user row looks like vs our inserted ones
const { rows: sample } = await client.query(`
  SELECT id, email, instance_id, aud, role, email_confirmed_at,
         confirmation_token, recovery_token, email_change_token_new
  FROM auth.users
  WHERE email IN ('admin@traveloop.com','abhi@traveloop.com')
`)
console.log('Current rows:', JSON.stringify(sample, null, 2))

// Fix: set instance_id to the standard Supabase zero UUID
await client.query(`
  UPDATE auth.users
  SET instance_id = '00000000-0000-0000-0000-000000000000'
  WHERE email IN ('admin@traveloop.com','abhi@traveloop.com')
  AND (instance_id IS NULL OR instance_id != '00000000-0000-0000-0000-000000000000')
`)
console.log('instance_id patched')

await client.end()
