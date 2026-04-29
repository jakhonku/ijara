import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    env[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Checking database tables on Supabase...');
  
  const tables = ['customers', 'equipment', 'rentals', 'payments'];
  const results = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        results.push({ table, status: 'NOT_FOUND', message: 'Table does not exist' });
      } else {
        results.push({ table, status: 'ERROR', message: error.message });
      }
    } else {
      results.push({ table, status: 'OK' });
    }
  }

  console.log('--- DATABASE STATUS ---');
  results.forEach(res => {
    console.log(`${res.table.padEnd(12)}: ${res.status} ${res.message ? `(${res.message})` : ''}`);
  });
}

checkDatabase();
