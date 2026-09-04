import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://oprudpfrjejpwtihrelo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnVkcGZyamVqcHd0aWhyZWxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMzMjI4NiwiZXhwIjoyMTAzOTA4Mjg2fQ.udsJwcEm80hrThMJtOJLVBgxFHEszp_PlUbkRT_NTq4";
const supabase = createClient(supabaseUrl, supabaseKey);
async function testQuery() {
  const { data, error } = await supabase.rpc("update_updated_at_column"); // We can`t run DDL like ALTER TABLE directly via JS client unless we use a Postgres function or we do it from SQL editor.
  console.log(error);
}
testQuery();

