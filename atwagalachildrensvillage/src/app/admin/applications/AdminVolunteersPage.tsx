"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { DirectRegisterFormVolunteers } from "./index";

export default function AdminVolunteersPage() {
  const [volunteerApps, setVolunteerApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    const { data } = await supabase.from("volunteer_applications").select("*").order('created_at', { ascending: false });
    setVolunteerApps(data || []);
    setLoading(false);
  };

  const approveApplication = async (id: string) => {
    setProcessingId(id);
    const appData = volunteerApps.find((a) => a.id === id);
    if (!appData) return;
    const { is_approved, ...cleanData } = appData;
    await supabase.from("volunteers").insert({ ...cleanData, is_active: true, created_at: new Date().toISOString() });
    await (supabase.from("volunteer_applications") as any).update({ is_approved: true }).eq("id", id);
    await fetchVolunteers();
    setProcessingId(null);
  };

  const registerDirect = async (data: any) => {
    await supabase.from("volunteers").insert({ ...data, is_active: true, created_at: new Date().toISOString() });
    await fetchVolunteers();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Volunteer Applications</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {volunteerApps.length === 0 ? <div>No volunteer applications found.</div> : volunteerApps.map(app => (
            <div key={app.id} className="border rounded p-4">
              <div className="font-bold">{app.full_name}</div>
              <div>{app.email} | {app.phone}</div>
              <div>{app.address}</div>
              <div>Skills: {app.skills}</div>
              {app.is_approved ? <span className="text-green-600">Approved</span> : (
                <button className="bg-green-600 text-white px-4 py-1 rounded mt-2" disabled={processingId===app.id} onClick={()=>approveApplication(app.id)}>
                  {processingId===app.id ? "Processing..." : "Approve & Register"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <h2 className="font-semibold mb-2">Direct Volunteer Registration</h2>
        <DirectRegisterFormVolunteers onRegister={registerDirect} />
      </div>
    </div>
  );
}