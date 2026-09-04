'use client';

import { useEffect, useState } from 'react';
import ImageCard from '@/components/ImageCard';
import TruncatedText from '@/components/TruncatedText';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface Achievement {
  id: string;
  image_url: string;
  title: string;
  description: string;
  achievement_date: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('achievement_date', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
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
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Achievements</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Celebrating our milestones and the impact we've made together.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="space-y-2">
              <ImageCard
                imageUrl={achievement.image_url}
                title={achievement.title}
                description={achievement.description}
              />
              <TruncatedText text={achievement.description} />
              <p className="text-sm text-gray-500 text-center">
                {formatDate(achievement.achievement_date)}
              </p>
            </div>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No achievements available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
