'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setStaff(data);
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Dedicated Staff</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Meet the hardworking individuals who dedicate their time to making a difference.
        </p>
      </div>

      {staff.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-lg">No staff members listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{member.full_name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-900">Nationality:</span> {member.nationality}</p>
                <p><span className="font-semibold text-gray-900">Email:</span> {member.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
