"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { DirectRegisterFormStaff } from "./index";

export default function AdminStaffPage() {
  const [staffApps, setStaffApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase.from("staff_applications").select("*").order('created_at', { ascending: false });
    setStaffApps(data || []);
    setLoading(false);
  };

  const approveApplication = async (id: string) => {
    setProcessingId(id);
    const appData = staffApps.find((a) => a.id === id);
    if (!appData) return;
    const { is_approved, ...cleanData } = appData;
    await supabase.from("staff").insert({ ...cleanData, is_active: true, created_at: new Date().toISOString() });
    await (supabase.from("staff_applications") as any).update({ is_approved: true }).eq("id", id);
    await fetchStaff();
    setProcessingId(null);
  };

  const registerDirect = async (data: any) => {
    await supabase.from("staff").insert({ ...data, is_active: true, created_at: new Date().toISOString() });
    await fetchStaff();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Staff Applications</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {staffApps.length === 0 ? <div>No staff applications found.</div> : staffApps.map(app => (
            <div key={app.id} className="border rounded p-4">
              <div className="font-bold">{app.full_name}</div>
              <div>{app.email} | {app.phone}</div>
              <div>{app.nationality} | {app.sex} | {app.dob}</div>
              {app.is_approved ? <span className="text-green-600">Approved</span> : (
                <button className="bg-blue-600 text-white px-4 py-1 rounded mt-2" disabled={processingId===app.id} onClick={()=>approveApplication(app.id)}>
                  {processingId===app.id ? "Processing..." : "Approve & Register"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <h2 className="font-semibold mb-2">Direct Staff Registration</h2>
        <DirectRegisterFormStaff onRegister={registerDirect} />
      </div>
    </div>
  );
}