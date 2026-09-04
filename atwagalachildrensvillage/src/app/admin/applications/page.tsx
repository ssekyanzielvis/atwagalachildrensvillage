"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface StaffApp {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  sex: string;
  dob: string;
  is_approved: boolean;
}

interface VolunteerApp {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  skills: string;
  is_approved: boolean;
}

interface PartnerApp {
  id: string;
  full_name: string;
  organization_name: string;
  offer: string;
  email: string;
  nationality: string;
  is_approved: boolean;
}

// Helper function to bypass TypeScript strict checking
const supabaseInsert = async (table: string, data: any) => {
  return await (supabase as any).from(table).insert(data);
};

const supabaseUpdate = async (table: string, data: any, eq: { column: string; value: string }) => {
  return await (supabase as any).from(table).update(data).eq(eq.column, eq.value);
};

export default function AdminApplicationsPage() {
  const [staffApps, setStaffApps] = useState<StaffApp[]>([]);
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApp[]>([]);
  const [partnerApps, setPartnerApps] = useState<PartnerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [staffRes, volunteerRes, partnerRes] = await Promise.all([
        supabase.from("staff_applications").select("*").order('created_at', { ascending: false }),
        supabase.from("volunteer_applications").select("*").order('created_at', { ascending: false }),
        supabase.from("partner_applications").select("*").order('created_at', { ascending: false }),
      ]);
      
      if (staffRes.data) setStaffApps(staffRes.data);
      if (volunteerRes.data) setVolunteerApps(volunteerRes.data);
      if (partnerRes.data) setPartnerApps(partnerRes.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (type: string, id: string) => {
    setProcessingId(`${type}-${id}`);
    
    try {
      let table: "staff_applications" | "volunteer_applications" | "partner_applications";
      let mainTable: "staff" | "volunteers" | "partners";
      let appData: any = null;
      
      if (type === "staff") {
        table = "staff_applications";
        mainTable = "staff";
        appData = staffApps.find((a) => a.id === id);
      } else if (type === "volunteer") {
        table = "volunteer_applications";
        mainTable = "volunteers";
        appData = volunteerApps.find((a) => a.id === id);
      } else if (type === "partner") {
        table = "partner_applications";
        mainTable = "partners";
        appData = partnerApps.find((a) => a.id === id);
      } else {
        throw new Error("Invalid application type");
      }
      
      if (!appData) {
        alert("Application not found!");
        return;
      }

      // Remove is_approved from appData since main table doesn't have this field
      const { is_approved, ...cleanData } = appData;

      // Insert into main table using helper function
      const { error: insertError } = await supabaseInsert(mainTable, {
        ...cleanData,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error inserting into main table:", insertError);
        alert("Failed to register. Please try again.");
        return;
      }

      // Mark application as approved using helper function
      const { error: updateError } = await supabaseUpdate(table, { is_approved: true }, { column: "id", value: id });

      if (updateError) {
        console.error("Error updating application:", updateError);
        alert("Application approved but failed to update status.");
      }

      // Refresh the list
      await fetchAll();
      
    } catch (error) {
      console.error("Error approving application:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const registerDirect = async (type: string, data: any) => {
    try {
      let mainTable: "staff" | "volunteers" | "partners";
      if (type === "staff") mainTable = "staff";
      else if (type === "volunteer") mainTable = "volunteers";
      else if (type === "partner") mainTable = "partners";
      else {
        throw new Error("Invalid type");
      }

      const { error } = await supabaseInsert(mainTable, {
        ...data,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error registering directly:", error);
        alert("Failed to register. Please try again.");
        return;
      }

      alert("Registered successfully!");
      await fetchAll();
    } catch (error) {
      console.error("Error in direct registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getApplicationCount = () => {
    const totalPending = [
      ...staffApps.filter(app => !app.is_approved),
      ...volunteerApps.filter(app => !app.is_approved),
      ...partnerApps.filter(app => !app.is_approved),
    ].length;
    
    const totalApproved = [
      ...staffApps.filter(app => app.is_approved),
      ...volunteerApps.filter(app => app.is_approved),
      ...partnerApps.filter(app => app.is_approved),
    ].length;
    
    return { totalPending, totalApproved, total: staffApps.length + volunteerApps.length + partnerApps.length };
  };

  const counts = getApplicationCount();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Applications Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage staff, volunteer, and partner applications</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-800 font-semibold">Total Applications</div>
            <div className="text-2xl font-bold text-blue-900">{counts.total}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800 font-semibold">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-900">{counts.totalPending}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 font-semibold">Approved</div>
            <div className="text-2xl font-bold text-green-900">{counts.totalApproved}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staff Applications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Staff Applications</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {staffApps.length} total
              </span>
            </div>
            {staffApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No staff applications found.
              </div>
            ) : (
              <div className="space-y-4">
                {staffApps.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">{app.full_name}</div>
                        <div className="text-sm text-gray-600 mt-1">{app.email}</div>
                        <div className="text-sm text-gray-600">{app.phone}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {app.nationality} • {app.sex} • {app.dob}
                        </div>
                      </div>
                      {app.is_approved && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Approved
                        </span>
                      )}
                    </div>
                    <button
                      className={`mt-4 w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        app.is_approved
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : processingId === `staff-${app.id}`
                          ? "bg-blue-500 text-white opacity-75"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      disabled={app.is_approved || processingId === `staff-${app.id}`}
                      onClick={() => approveApplication("staff", app.id)}
                    >
                      {processingId === `staff-${app.id}` ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          Processing...
                        </span>
                      ) : app.is_approved ? (
                        "✓ Approved"
                      ) : (
                        "Approve & Register"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-4">Direct Staff Registration</h3>
              <DirectRegisterForm type="staff" onRegister={registerDirect} />
            </div>
          </div>

          {/* Volunteer Applications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Volunteer Applications</h2>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {volunteerApps.length} total
              </span>
            </div>
            {volunteerApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No volunteer applications found.
              </div>
            ) : (
              <div className="space-y-4">
                {volunteerApps.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">{app.full_name}</div>
                        <div className="text-sm text-gray-600 mt-1">{app.email}</div>
                        <div className="text-sm text-gray-600">{app.phone}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          <div className="truncate">{app.address}</div>
                          <div className="mt-1">Skills: {app.skills}</div>
                        </div>
                      </div>
                      {app.is_approved && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Approved
                        </span>
                      )}
                    </div>
                    <button
                      className={`mt-4 w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        app.is_approved
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : processingId === `volunteer-${app.id}`
                          ? "bg-green-500 text-white opacity-75"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                      disabled={app.is_approved || processingId === `volunteer-${app.id}`}
                      onClick={() => approveApplication("volunteer", app.id)}
                    >
                      {processingId === `volunteer-${app.id}` ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          Processing...
                        </span>
                      ) : app.is_approved ? (
                        "✓ Approved"
                      ) : (
                        "Approve & Register"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-4">Direct Volunteer Registration</h3>
              <DirectRegisterForm type="volunteer" onRegister={registerDirect} />
            </div>
          </div>

          {/* Partner Applications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Partner Applications</h2>
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                {partnerApps.length} total
              </span>
            </div>
            {partnerApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No partner applications found.
              </div>
            ) : (
              <div className="space-y-4">
                {partnerApps.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">{app.full_name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {app.organization_name}
                        </div>
                        <div className="text-sm text-gray-600">{app.email}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Offer: {app.offer}
                          <div className="mt-1">Nationality: {app.nationality}</div>
                        </div>
                      </div>
                      {app.is_approved && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Approved
                        </span>
                      )}
                    </div>
                    <button
                      className={`mt-4 w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        app.is_approved
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : processingId === `partner-${app.id}`
                          ? "bg-purple-500 text-white opacity-75"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                      disabled={app.is_approved || processingId === `partner-${app.id}`}
                      onClick={() => approveApplication("partner", app.id)}
                    >
                      {processingId === `partner-${app.id}` ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          Processing...
                        </span>
                      ) : app.is_approved ? (
                        "✓ Approved"
                      ) : (
                        "Approve & Register"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-4">Direct Partner Registration</h3>
              <DirectRegisterForm type="partner" onRegister={registerDirect} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DirectRegisterForm({ type, onRegister }: { type: string; onRegister: (type: string, data: any) => void }) {
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