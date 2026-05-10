import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const DB = 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres'
const SUPABASE_URL = 'https://yvvxwwturdyknqkcxbir.supabase.co'
// anon key — used only for signUp (public endpoint)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnh3d3R1cmR5a25xa2N4YmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODM4NzgsImV4cCI6MjA5Mzk1OTg3OH0.8Ylzk0KRb-xSEupvFNrbS0e3GEufJSmIFLDqwnV_wf8'

const client = new pg.Client({ connectionString: DB, ssl: { rejectUnauthorized: false } })
const supabase = createClient(SUPABASE_URL, ANON_KEY)

await client.connect()

// 1. Delete old broken admin user entirely
await client.query(`DELETE FROM auth.identities WHERE provider_id = 'admin@traveloop.com'`)
await client.query(`DELETE FROM public.users WHERE email = 'admin@traveloop.com'`)
await client.query(`DELETE FROM auth.users WHERE email = 'admin@traveloop.com'`)
console.log('Deleted old admin user')

await client.end()

// 2. Sign up fresh through GoTrue (proper flow)
const { data, error } = await supabase.auth.signUp({
  email: 'admin@traveloop.com',
  password: 'Admin@1234',
  options: { data: { name: 'Admin' } },
})

if (error) {
  console.error('SignUp error:', error.message)
  process.exit(1)
}

console.log('SignUp result:', {
  user: data.user?.email,
  session: data.session ? 'session created (email confirm OFF)' : 'no session (confirm email sent)',
})

// 3. Force-confirm via DB (in case email confirmation is required)
if (!data.session) {
  const client2 = new pg.Client({ connectionString: DB, ssl: { rejectUnauthorized: false } })
  await client2.connect()
  await client2.query(`
    UPDATE auth.users
    SET email_confirmed_at = NOW(), confirmed_at = NOW(), updated_at = NOW()
    WHERE email = 'admin@traveloop.com'
  `)
  await client2.end()
  console.log('Force-confirmed email in DB')
}

console.log('\nDone. Try: admin@traveloop.com / Admin@1234')
