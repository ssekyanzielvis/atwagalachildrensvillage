"use client";

import { useState } from "react";

interface Props {
  type: "staff" | "volunteer" | "partner";
  onRegister: (type: string, data: any) => void;
}

export default function DirectRegisterForm({ type, onRegister }: Props) {
  const [fields, setFields] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  let formFields: { name: string; label: string; type?: string; placeholder?: string }[] = [];
  if (type === "staff") {
    formFields = [
      { name: "full_name", label: "Full Name", placeholder: "Enter full name" },
      { name: "email", label: "Email Address", type: "email", placeholder: "Enter email address" },
      { name: "phone", label: "Phone Number", placeholder: "Enter phone number" },
      { name: "nationality", label: "Nationality", placeholder: "Enter nationality" },
      { name: "sex", label: "Gender", placeholder: "Male/Female/Other" },
      { name: "dob", label: "Date of Birth", type: "date" },
    ];
  } else if (type === "volunteer") {
    formFields = [
      { name: "full_name", label: "Full Name", placeholder: "Enter full name" },
      { name: "email", label: "Email", type: "email", placeholder: "Enter email address" },
      { name: "phone", label: "Phone Number", placeholder: "Enter phone number" },
      { name: "address", label: "Home Address", placeholder: "Enter full address" },
      { name: "skills", label: "Skills & Expertise", placeholder: "Enter skills separated by commas" },
    ];
  } else if (type === "partner") {
    formFields = [
      { name: "full_name", label: "Contact Person", placeholder: "Enter contact person name" },
      { name: "organization_name", label: "Organization Name", placeholder: "Enter organization name" },
      { name: "offer", label: "What to Offer", placeholder: "Describe what you offer" },
      { name: "email", label: "Email", type: "email", placeholder: "Enter email address" },
      { name: "nationality", label: "Nationality", placeholder: "Enter nationality" },
    ];
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onRegister(type, fields);
      setFields({});
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {formFields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {f.label}
          </label>
          {f.name === "skills" || f.name === "offer" ? (
            <textarea
              name={f.name}
              value={fields[f.name] || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={f.placeholder}
              rows={2}
              required
            />
          ) : (
            <input
              name={f.name}
              type={f.type || "text"}
              value={fields[f.name] || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={f.placeholder}
              required
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Registering..." : "Register Directly"}
      </button>
    </form>
  );
}