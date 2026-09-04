'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification } from '@/lib/store';

export default function AdminProgramSponsorsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'applications' | 'sponsors'>('applications');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, sponsorsRes, programsRes] = await Promise.all([
        (supabase.from('program_sponsorship_applications') as any).select('*').order('created_at', { ascending: false }),
        (supabase.from('program_sponsors') as any).select('*').order('created_at', { ascending: false }),
        (supabase.from('programs') as any).select('id, title')
      ]);

      if (appsRes.error) throw appsRes.error;
      if (sponsorsRes.error) throw sponsorsRes.error;
      if (programsRes.error) throw programsRes.error;

      setApplications(appsRes.data || []);
      setSponsors(sponsorsRes.data || []);
      setPrograms(programsRes.data || []);
    } catch (error: any) {
      showNotification('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: any) => {
    if (!confirm('Approve this application and register them as a sponsor?')) return;
    
    try {
      const { error: insertError } = await (supabase.from('program_sponsors') as any).insert({
        program_id: app.program_id,
        full_name: app.full_name,
        email: app.email,
        phone: app.phone,
        logo_url: app.logo_url
      });

      if (insertError) throw insertError;

      const { error: updateError } = await (supabase.from('program_sponsorship_applications') as any)
        .update({ is_approved: true })
        .eq('id', app.id);

      if (updateError) throw updateError;

      showNotification('Sponsor approved successfully', 'success');
      fetchData();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Are you sure you want to remove this sponsor?')) return;
    
    try {
      const { error } = await (supabase.from('program_sponsors') as any).delete().eq('id', id);
      if (error) throw error;
      showNotification('Sponsor removed', 'success');
      fetchData();
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const getProgramTitle = (id: string) => {
    const p = programs.find(p => p.id === id);
    return p ? p.title : 'Unknown Program';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Program Sponsors Management</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'applications' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
        >
          New Applications ({applications.filter(a => !a.is_approved).length})
        </button>
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'sponsors' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
        >
          Active Sponsors ({sponsors.length})
        </button>
      </div>

      {activeTab === 'applications' ? (
        <div className="space-y-4">
          {applications.length === 0 ? <div>No sponsorship applications found.</div> : applications.map(app => (
            <div key={app.id} className="bg-white border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{app.full_name}</div>
                  <div className="text-gray-600 text-sm mb-2">Program: {getProgramTitle(app.program_id)}</div>
                  {app.logo_url && (
                    <img src={app.logo_url} alt="Logo" className="h-12 w-auto object-contain my-2" />
                  )}
                  <div>Email: {app.email}</div>
                  <div>Phone: {app.phone || 'N/A'}</div>
                  <div className="mt-2 text-gray-700">Message: {app.message}</div>
                </div>
                <div>
                  {app.is_approved ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle size={16}/> Approved</span>
                  ) : (
                    <button 
                      onClick={() => handleApprove(app)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.length === 0 ? <div>No active sponsors found.</div> : sponsors.map(sponsor => (
            <div key={sponsor.id} className="bg-white border rounded p-4 flex flex-col justify-between">
              <div>
                <div className="font-bold text-lg mb-1">{sponsor.full_name}</div>
                <div className="text-blue-600 text-sm mb-3">{getProgramTitle(sponsor.program_id)}</div>
                {sponsor.logo_url && (
                  <img src={sponsor.logo_url} alt="Logo" className="h-16 w-auto object-contain mb-3" />
                )}
                <div className="text-sm text-gray-600">Email: {sponsor.email}</div>
                <div className="text-sm text-gray-600">Phone: {sponsor.phone || 'N/A'}</div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <button 
                  onClick={() => handleDeleteSponsor(sponsor.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <XCircle size={16}/> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
