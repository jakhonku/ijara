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

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  console.log('Creating admin user...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'jakhongirbakhtiyarov0130@gmail.com',
    password: '12345678',
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('User already exists. Updating password...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === 'jakhongirbakhtiyarov0130@gmail.com').id,
        { password: '12345678' }
      );
      if (updateError) console.error('Error updating user:', updateError.message);
      else console.log('Password updated successfully!');
    } else {
      console.error('Error creating user:', error.message);
    }
  } else {
    console.log('User created successfully!');
  }
}

createUser();
