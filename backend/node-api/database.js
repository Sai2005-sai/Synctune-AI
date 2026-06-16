const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ltmxbuzhwmpymhsqpeha.supabase.co';
const supabaseKey = 'sb_publishable_xDXUqbUk7KAjV_h8itKmvw_MZxsDtGI';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Initialized Supabase REST Client');

module.exports = supabase;
