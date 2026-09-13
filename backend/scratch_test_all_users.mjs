import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/Shubham/Sync Learn/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllUsers() {
  const { data, error } = await supabase.from('users').select('username, email');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('All Users:', data);
  }
}
checkAllUsers();
