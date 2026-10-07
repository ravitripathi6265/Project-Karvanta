import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPending() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, professional_details(*)')
    .eq('status', 'pending');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Pending profiles:', JSON.stringify(data, null, 2));
  }
}

checkPending();
