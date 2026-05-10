import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Run schema + seed via Supabase REST
const url = 'https://yvvxwwturdyknqkcxbir.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnh3d3R1cmR5a25xa2N4YmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODM4NzgsImV4cCI6MjA5Mzk1OTg3OH0.8Ylzk0KRb-xSEupvFNrbS0e3GEufJSmIFLDqwnV_wf8'

console.log('Note: Schema DDL must be run in Supabase Dashboard SQL Editor.')
console.log('Copy content of supabase/schema.sql and run it there first.')
console.log('Then run this script for seed data only.')
console.log('\nTesting connection...')

const supabase = createClient(url, key)
const { data, error } = await supabase.from('cities').select('count').single()
if (error?.code === '42P01') {
  console.error('ERROR: Tables not found. Run schema.sql in Supabase dashboard first.')
  process.exit(1)
}
console.log('Connection OK.')
