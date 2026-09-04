'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';

interface Leader {
  id: string;
  image_url: string;
  full_name: string;
  title: string;
  achievement: string | null;
  order_index: number;
}

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('leadership')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Leadership</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Meet the dedicated individuals who guide our organization toward achieving its mission.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative w-full h-80">
                <img
                  src={leader.image_url}
                  alt={leader.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{leader.full_name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{leader.title}</p>
                {leader.achievement && (
                  <p className="text-gray-700 leading-relaxed">{leader.achievement}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {leaders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No leadership profiles available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
