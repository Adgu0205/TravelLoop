import pg from 'pg'
import bcrypt from 'bcryptjs'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

await client.connect()

const { rows } = await client.query(
  `SELECT email, encrypted_password FROM auth.users WHERE email = 'admin@traveloop.com'`
)

const { email, encrypted_password } = rows[0]
console.log('Hash prefix:', encrypted_password.substring(0, 7))
console.log('Full hash:', encrypted_password)

// Verify password matches the stored hash
const match = await bcrypt.compare('Admin@1234', encrypted_password)
console.log('Password "Admin@1234" matches hash:', match)

await client.end()
