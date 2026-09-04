"use client";

import { useState } from "react";

export default function DirectRegisterFormStaff({ onRegister }: { onRegister: (data: any) => void }) {
  const [fields, setFields] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onRegister(fields);
    setFields({});
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="full_name" placeholder="Full Name" value={fields.full_name || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="email" type="email" placeholder="Email" value={fields.email || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="phone" placeholder="Phone" value={fields.phone || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="nationality" placeholder="Nationality" value={fields.nationality || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="sex" placeholder="Gender" value={fields.sex || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="dob" type="date" placeholder="Date of Birth" value={fields.dob || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">{submitting ? "Registering..." : "Register Directly"}</button>
    </form>
  );
}