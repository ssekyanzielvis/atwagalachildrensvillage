"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  skills: string;
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("is_active", true)
      .order("full_name", { ascending: true });
    if (!error && data) setVolunteers(data);
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Volunteers</h1>
        {loading ? (
          <div className="flex justify-center py-12"><span>Loading...</span></div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No volunteers found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {volunteers.map((volunteer) => (
              <div key={volunteer.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">{volunteer.full_name}</h2>
                <p className="text-sm text-gray-700 mb-1">Email: {volunteer.email}</p>
                <p className="text-sm text-gray-700 mb-1">Phone: {volunteer.phone}</p>
                <p className="text-sm text-gray-700 mb-1">Home Address: {volunteer.address}</p>
                <p className="text-sm text-gray-700 mb-1">Skills: {volunteer.skills}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
