import pg from 'pg'

const client = new pg.Client({
  connectionString: 'postgresql://postgres:Travelloopodoo@db.yvvxwwturdyknqkcxbir.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
})

// Verified Unsplash photo IDs (current as of 2025) with proper format params
const CITY_IMAGES = {
  'Bangkok':    'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&auto=format&fit=crop&q=80',
  'Bali':       'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&auto=format&fit=crop&q=80',
  'Tokyo':      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&auto=format&fit=crop&q=80',
  'Paris':      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
  'Dubai':      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop&q=80',
  'Singapore':  'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&auto=format&fit=crop&q=80',
  'Rome':       'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
  'Barcelona':  'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80',
  'London':     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
  'New York':   'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&auto=format&fit=crop&q=80',
  'Santorini':  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80',
  'Kyoto':      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
  'Amsterdam':  'https://images.unsplash.com/photo-1576924542622-772281b13739?w=800&auto=format&fit=crop&q=80',
  'Istanbul':   'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80',
  'Maldives':   'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&auto=format&fit=crop&q=80',
  'Sydney':     'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80',
  'Prague':     'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&auto=format&fit=crop&q=80',
  'Marrakech':  'https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=800&auto=format&fit=crop&q=80',
  'Mumbai':     'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&auto=format&fit=crop&q=80',
  'New Delhi':  'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
  'Goa':        'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&auto=format&fit=crop&q=80',
  'Phuket':     'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&auto=format&fit=crop&q=80',
}

await client.connect()

let updated = 0
for (const [name, url] of Object.entries(CITY_IMAGES)) {
  const { rowCount } = await client.query(
    `UPDATE public.cities SET cover_image_url = $1 WHERE name = $2`,
    [url, name]
  )
  if (rowCount > 0) {
    console.log(`✓ ${name}`)
    updated++
  } else {
    console.log(`  skipped (not found): ${name}`)
  }
}

await client.end()
console.log(`\nUpdated ${updated} cities.`)
