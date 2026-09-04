'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import { TrendingUp, Users, Eye, DollarSign } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

type AnalyticsData = Database['public']['Tables']['analytics']['Row'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [stats, setStats] = useState({
    totalPageViews: 0,
    uniqueVisitors: 0,
    totalDonations: 0,
    totalContacts: 0,
  });

  useEffect(() => {
    fetchAnalytics();
    fetchStats();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await (supabase
        .from('analytics') as any)
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error: any) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [analyticsCount, donationsData, contactsCount] = await Promise.all([
        (supabase.from('analytics') as any).select('*', { count: 'exact', head: true }),
        (supabase.from('donations') as any).select('amount'),
        (supabase.from('contact_submissions') as any).select('*', { count: 'exact', head: true }),
      ]);

      const uniqueVisitors = new Set(analytics.map((a) => a.visitor_id)).size;
      const totalDonations = donationsData.data?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0;

      setStats({
        totalPageViews: analyticsCount.count || 0,
        uniqueVisitors: uniqueVisitors || 0,
        totalDonations,
        totalContacts: contactsCount.count || 0,
      });
    } catch (error: any) {
      console.error('Failed to load stats', error);
    }
  };

  const getPageViews = () => {
    const pageViews: { [key: string]: number } = {};
    analytics
      .filter((a) => a.page_path !== null)
      .forEach((a) => {
        const path = a.page_path as string;
        pageViews[path] = (pageViews[path] || 0) + 1;
      });
    return Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const getRecentActivity = () => {
    return analytics.slice(0, 20);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Page Views</h3>
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{stats.totalPageViews.toLocaleString()}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Unique Visitors</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{stats.uniqueVisitors.toLocaleString()}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Donations</h3>
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">UGX {stats.totalDonations.toLocaleString()}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Contact Submissions</h3>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{stats.totalContacts.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Top Pages</h2>
          <div className="space-y-3">
            {getPageViews().map(([page, views]) => (
              <div key={page} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{page}</span>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 h-2 rounded-full" style={{ width: `${(views / stats.totalPageViews) * 200}px` }}></div>
                  <span className="text-sm font-semibold text-gray-900">{views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getRecentActivity().map((activity) => (
              <div key={activity.id} className="text-sm border-b pb-2">
                <p className="font-medium text-gray-900">{activity.page_path}</p>
                <p className="text-gray-500 text-xs">
                  {activity.action_type} • {new Date(activity.visited_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Analytics are tracked automatically when visitors browse the website.
          Data includes page views, visitor actions, and engagement metrics.
        </p>
      </div>
    </div>
  );
}

