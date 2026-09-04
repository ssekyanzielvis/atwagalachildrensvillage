"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { DirectRegisterFormPartners } from './index';

export default function AdminPartnersPage() {
  const [partnerApps, setPartnerApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    const { data } = await supabase.from("partner_applications").select("*").order('created_at', { ascending: false });
    setPartnerApps(data || []);
    setLoading(false);
  };

  const approveApplication = async (id: string) => {
    setProcessingId(id);
    const appData = partnerApps.find((a) => a.id === id);
    if (!appData) return;
    const { is_approved, ...cleanData } = appData;
    await supabase.from("partners").insert({ ...cleanData, is_active: true, created_at: new Date().toISOString() });
    await (supabase.from("partner_applications") as any).update({ is_approved: true }).eq("id", id);
    await fetchPartners();
    setProcessingId(null);
  };

  const registerDirect = async (data: any) => {
    await supabase.from("partners").insert({ ...data, is_active: true, created_at: new Date().toISOString() });
    await fetchPartners();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Partner Applications</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {partnerApps.length === 0 ? <div>No partner applications found.</div> : partnerApps.map(app => (
            <div key={app.id} className="border rounded p-4">
              {app.logo_url && (
                <div className="mb-3">
                  <img src={app.logo_url} alt="Business Logo" className="h-16 w-auto object-contain rounded" />
                </div>
              )}
              <div className="font-bold text-lg">{app.business_name}</div>
              <div className="text-gray-600">Contact: {app.full_name}</div>
              {app.organization_name && <div>Org: {app.organization_name}</div>}
              <div>Email: {app.email}</div>
              <div>Offer: {app.offer}</div>
              <div>Nationality: {app.nationality}</div>
              {app.is_approved ? <span className="text-green-600">Approved</span> : (
                <button className="bg-purple-600 text-white px-4 py-1 rounded mt-2" disabled={processingId===app.id} onClick={()=>approveApplication(app.id)}>
                  {processingId===app.id ? "Processing..." : "Approve & Register"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <h2 className="font-semibold mb-2">Direct Partner Registration</h2>
        <DirectRegisterFormPartners onRegister={registerDirect} />
      </div>
    </div>
  );
}