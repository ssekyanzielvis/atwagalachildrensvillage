
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://oprudpfrjejpwtihrelo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnVkcGZyamVqcHd0aWhyZWxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMzMjI4NiwiZXhwIjoyMTAzOTA4Mjg2fQ.udsJwcEm80hrThMJtOJLVBgxFHEszp_PlUbkRT_NTq4'
);
async function test() {
  const { data, error } = await supabase.from('merchant_codes').select('*').limit(1);
  console.log('Error:', error);
}
test();

