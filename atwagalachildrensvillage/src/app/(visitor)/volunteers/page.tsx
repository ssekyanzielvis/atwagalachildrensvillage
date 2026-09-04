'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const { data, error } = await supabase
          .from('volunteers')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setVolunteers(data);
        }
      } catch (err) {
        console.error('Error fetching volunteers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Volunteers</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We are deeply grateful for our volunteers who share their time and skills to support our mission.
        </p>
      </div>

      {volunteers.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-lg">No volunteers listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {volunteers.map((volunteer) => (
            <div key={volunteer.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{volunteer.full_name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {volunteer.skills && (
                  <p><span className="font-semibold text-gray-900">Skills:</span> {volunteer.skills}</p>
                )}
                {volunteer.address && (
                  <p><span className="font-semibold text-gray-900">Address:</span> {volunteer.address}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
