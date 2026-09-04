"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StaffApplicationPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    nationality: "",
    sex: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    const { full_name, email, phone, nationality, sex, dob } = form;
    if (!full_name || !email || !phone || !nationality || !sex || !dob) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("staff_applications")
        .insert({
          full_name,
          email,
          phone,
          nationality,
          sex,
          dob
        } as any);

      if (error) {
        console.error("Supabase error:", error);
        setError("Submission failed. Please try again.");
      } else {
        setSuccess(true);
        setForm({ full_name: "", email: "", phone: "", nationality: "", sex: "", dob: "" });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-xl mx-auto py-16 px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Become a Staff Member</h1>
          <form className="space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 font-semibold">Full Name</label>
              <input 
                type="text" 
                name="full_name" 
                value={form.full_name} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Nationality</label>
              <input 
                type="text" 
                name="nationality" 
                value={form.nationality} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Gender</label>
              <input 
                type="text" 
                name="sex" 
                value={form.sex} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Date of Birth</label>
              <input 
                type="date" 
                name="dob" 
                value={form.dob} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">Application submitted successfully!</p>}
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors" 
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}