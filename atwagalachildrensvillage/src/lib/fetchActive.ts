import { supabase } from "@/lib/supabase/client";

// Fetch all active staff
export async function fetchActiveStaff() {
  return await supabase
    .from("staff")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });
}

// Fetch all active volunteers
export async function fetchActiveVolunteers() {
  return await supabase
    .from("volunteers")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });
}

// Fetch all active partners
export async function fetchActivePartners() {
  return await supabase
    .from("partners")
    .select("*")
    .eq("is_active", true)
    .order("organization_name", { ascending: true });
}
