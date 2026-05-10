import pg from 'pg'
import bcrypt from 'bcryptjs'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

const USERS = [
  { email: 'abhi@traveloop.com', password: 'Traveloop@123' },
  { email: 'admin@traveloop.com', password: 'Admin@1234' },
]

await client.connect()

for (const u of USERS) {
  const { rows } = await client.query('SELECT id FROM auth.users WHERE email = $1', [u.email])
  if (!rows.length) { console.log('not found:', u.email); continue }
  const id = rows[0].id
  const now = new Date().toISOString()
  const identityData = JSON.stringify({ sub: id, email: u.email })

  // Insert identity row if missing (required by GoTrue for email/password login)
  await client.query(`
    INSERT INTO auth.identities
      (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id)
    VALUES
      ($1::uuid, $1::uuid, $2::jsonb, 'email', $3::timestamptz, $3::timestamptz, $3::timestamptz, $4)
    ON CONFLICT DO NOTHING
  `, [id, identityData, now, u.email])

  // Refresh password hash + confirm email
  const hash = await bcrypt.hash(u.password, 10)
  await client.query(`
    UPDATE auth.users
    SET encrypted_password = $1, email_confirmed_at = NOW(), updated_at = NOW()
    WHERE id = $2::uuid
  `, [hash, id])

  console.log('✓ fixed:', u.email)
}

await client.end()
console.log('Done. Try signing in now.')
