import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/Shubham/Sync Learn/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const email = 'trainer@gmail.com';
  const { data, error } = await supabase.from('users').select('*').eq('email', email);
  if (error) {
    console.error('Error fetching user:', error);
  } else {
    console.log('User data:', data);
  }
}

checkUser();
