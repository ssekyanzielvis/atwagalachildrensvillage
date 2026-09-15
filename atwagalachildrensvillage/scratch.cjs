
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://oprudpfrjejpwtihrelo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnVkcGZyamVqcHd0aWhyZWxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMzMjI4NiwiZXhwIjoyMTAzOTA4Mjg2fQ.udsJwcEm80hrThMJtOJLVBgxFHEszp_PlUbkRT_NTq4'
);
async function test() {
  // Check gallery bucket details
  const { data: buckets } = await supabase.storage.listBuckets();
  const galleryBucket = buckets?.find(b => b.name === 'gallery');
  console.log('Gallery bucket:', JSON.stringify(galleryBucket, null, 2));

  // Check what images are in gallery table
  const { data: rows } = await supabase.from('gallery').select('id, image_url, is_active').limit(5);
  console.log('Gallery rows:', JSON.stringify(rows, null, 2));
}
test();

