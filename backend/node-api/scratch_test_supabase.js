const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ltmxbuzhwmpymhsqpeha.supabase.co';
const supabaseKey = 'sb_publishable_xDXUqbUk7KAjV_h8itKmvw_MZxsDtGI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('Connecting to Supabase...');
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('Supabase Query Error:', error);
    } else {
      console.log('Supabase Connection Success! Data:', data);
    }
  } catch(e) {
    console.error('Network/Execution error:', e);
  }
}

test();
