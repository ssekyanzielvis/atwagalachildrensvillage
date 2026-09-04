"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Partner {
  id: string;
  full_name: string;
  organization_name: string;
  offer: string;
  email: string;
  nationality: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("is_active", true)
      .order("organization_name", { ascending: true });
    if (!error && data) setPartners(data);
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Partners</h1>
        {loading ? (
          <div className="flex justify-center py-12"><span>Loading...</span></div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No partners found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">{partner.full_name}</h2>
                <p className="text-sm text-gray-700 mb-1">Organisation: {partner.organization_name}</p>
                <p className="text-sm text-gray-700 mb-1">What to Offer: {partner.offer}</p>
                <p className="text-sm text-gray-700 mb-1">Email: {partner.email}</p>
                <p className="text-sm text-gray-700 mb-1">Nationality: {partner.nationality}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
