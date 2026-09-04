"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

export default function DirectRegisterFormPartners({ onRegister }: { onRegister: (data: any) => void }) {
  const [fields, setFields] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <input name="full_name" placeholder="Contact Person" value={fields.full_name || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="organization_name" placeholder="Organization Name (Optional)" value={fields.organization_name || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      <input name="business_name" placeholder="Business Name" value={fields.business_name || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <div className="border rounded p-3">
        <label className="block text-sm text-gray-600 mb-2">Business Logo</label>
        <FileUpload 
          bucket="partners"
          onUploadComplete={(url) => setFields({ ...fields, logo_url: url })}
        />
        {fields.logo_url && <p className="text-sm text-green-600 mt-1">Logo added!</p>}
      </div>
      <textarea name="offer" placeholder="What to Offer" value={fields.offer || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="email" type="email" placeholder="Email" value={fields.email || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <input name="nationality" placeholder="Nationality" value={fields.nationality || ""} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      <button type="submit" disabled={submitting} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">{submitting ? "Registering..." : "Register Directly"}</button>
    </form>
  );
}