"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Staff {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  sex: string;
  dob: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .order("full_name", { ascending: true });
    if (!error && data) setStaff(data);
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Organization Staff Members</h1>
        {loading ? (
          <div className="flex justify-center py-12"><span>Loading...</span></div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No staff members found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {staff.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">{member.full_name}</h2>
                <p className="text-sm text-gray-700 mb-1">Email: {member.email}</p>
                <p className="text-sm text-gray-700 mb-1">Phone: {member.phone}</p>
                <p className="text-sm text-gray-700 mb-1">Nationality: {member.nationality}</p>
                <p className="text-sm text-gray-700 mb-1">Sex: {member.sex}</p>
                <p className="text-sm text-gray-700 mb-1">Date of Birth: {member.dob}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
