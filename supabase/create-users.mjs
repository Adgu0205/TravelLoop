import pg from 'pg'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

const USERS = [
  { email: 'abhi@traveloop.com', password: 'Traveloop@123', name: 'Abhijeet' },
  { email: 'admin@traveloop.com', password: 'Admin@1234',   name: 'Admin' },
]

async function createUser({ email, password, name }) {
  // Skip if already exists
  const { rows: existing } = await client.query(
    `SELECT id FROM auth.users WHERE email = $1`, [email]
  )
  if (existing.length > 0) {
    console.log(`⚠  ${email} already exists — skipping`)
    return
  }

  const id = randomUUID()
  const encrypted = await bcrypt.hash(password, 10)
  const now = new Date().toISOString()

  // Insert into auth.users
  await client.query(`
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, aud, role,
      raw_user_meta_data, raw_app_meta_data,
      is_super_admin, confirmation_token, recovery_token
    ) VALUES (
      $1, '00000000-0000-0000-0000-000000000000', $2, $3, $4,
      $4, $4, 'authenticated', 'authenticated',
      $5::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
      false, '', ''
    )
  `, [id, email, encrypted, now, JSON.stringify({ name })])

  // Fetch the actual id (in case of conflict/existing)
  const { rows } = await client.query(
    `SELECT id FROM auth.users WHERE email = $1`, [email]
  )
  const uid = rows[0].id

  // Insert into auth.identities (required by GoTrue for email login)
  await client.query(`
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      $1, $1,
      jsonb_build_object('sub', $1::text, 'email', $2),
      'email', $3, $3, $3, $2
    )
    ON CONFLICT DO NOTHING
  `, [uid, email, now])

  // Insert into public.users
  await client.query(`
    INSERT INTO public.users (id, email, name, language, currency)
    VALUES ($1, $2, $3, 'en', 'INR')
    ON CONFLICT (id) DO NOTHING
  `, [uid, email, name])

  console.log(`✓ ${name} <${email}>  password: ${password}`)
}

try {
  await client.connect()
  for (const u of USERS) await createUser(u)
  console.log('\n✅ Users ready. Sign in at http://localhost:5174/auth')
} catch (err) {
  console.error('❌', err.message)
  process.exit(1)
} finally {
  await client.end()
}
