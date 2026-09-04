'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProgramSponsorApplicationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const programId = searchParams.get('program_id');
  const [program, setProgram] = useState<any>(null);
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
    logoUrl: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (programId) {
      fetchProgram(programId);
    } else {
      setFetching(false);
    }
  }, [programId]);

  const fetchProgram = async (id: string) => {
    try {
      const { data, error } = await (supabase.from('programs') as any).select('*').eq('id', id).single();
      if (error) throw error;
      setProgram(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!programId) {
      setError('No program selected to sponsor.');
      setLoading(false);
      return;
    }

    if (!form.fullName || !form.email) {
      setError('Please provide your name and email.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await (supabase.from('program_sponsorship_applications') as any).insert({
        program_id: programId,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        message: form.message,
        logo_url: form.logoUrl,
      });

      if (insertError) throw insertError;
      
      setSuccess(true);
      setForm({ fullName: '', email: '', phone: '', message: '', logoUrl: '' });
      
      // Redirect back to programs page after 3 seconds
      setTimeout(() => {
        navigate('/programs');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Sponsor a Program</h1>
            {program ? (
              <p className="text-lg text-gray-600">
                You are applying to sponsor: <strong className="text-purple-600">{program.title}</strong>
              </p>
            ) : (
              <p className="text-red-500 font-semibold">No program selected. Please go back to the programs page and select one.</p>
            )}
          </div>

          <form className="bg-white p-8 rounded-lg shadow-lg space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 font-semibold">Full Name / Organization <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Email Address <span className="text-red-500">*</span></label>
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
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Your Message (Optional)</label>
              <textarea 
                name="message" 
                value={form.message} 
                onChange={handleChange} 
                placeholder="Why do you want to sponsor this program? Any specific details?"
                className="w-full border rounded px-3 py-2" 
                rows={4}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Your Logo (Optional)</label>
              <p className="text-sm text-gray-500 mb-2">Upload your company or personal logo to be displayed on the program page.</p>
              <div className="border rounded p-4 bg-gray-50">
                <FileUpload 
                  bucket="program-sponsors"
                  onUploadComplete={(url) => setForm({ ...form, logoUrl: url })}
                />
                {form.logoUrl && <p className="text-sm text-green-600 mt-2 font-medium">Logo uploaded successfully!</p>}
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
            
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center">
                <h3 className="font-bold text-lg mb-2">Application Submitted!</h3>
                <p>Thank you for your interest in sponsoring this program. We will review your application and contact you soon.</p>
              </div>
            ) : (
              <button 
                type="submit" 
                disabled={loading || !programId}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
