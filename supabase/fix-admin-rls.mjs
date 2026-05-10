import pg from 'pg'

const ADMIN_EMAIL = 'admin@traveloop.com'
const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

// 1. Ensure admin exists in public.users with correct UUID
const { rows: authAdmin } = await client.query(
  `SELECT id FROM auth.users WHERE email = $1`, [ADMIN_EMAIL]
)
if (!authAdmin.length) { console.error('Admin not in auth.users!'); process.exit(1) }
const adminId = authAdmin[0].id
console.log('Admin auth UUID:', adminId)

await client.query(`
  INSERT INTO public.users (id, email, name, language, currency)
  VALUES ($1, $2, 'Admin', 'en', 'INR')
  ON CONFLICT (id) DO UPDATE SET email = $2, name = 'Admin'
`, [adminId, ADMIN_EMAIL])
console.log('public.users synced for admin')

// 2. Add admin bypass policies so admin can read all rows
const adminCheck = `(auth.jwt() ->> 'email' = '${ADMIN_EMAIL}')`

const tables = ['users', 'trips', 'budgets', 'stops', 'stop_activities',
                'checklist_items', 'trip_notes']

for (const table of tables) {
  // Drop old admin policy if exists, recreate
  await client.query(`DROP POLICY IF EXISTS "${table}_admin_read" ON public.${table}`)
  await client.query(`
    CREATE POLICY "${table}_admin_read" ON public.${table}
    FOR SELECT USING (${adminCheck})
  `)
  console.log(`  admin SELECT policy on ${table}`)
}

await client.end()
console.log('\nDone. Admin can now read all rows.')
