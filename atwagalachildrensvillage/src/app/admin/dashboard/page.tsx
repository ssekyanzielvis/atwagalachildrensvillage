'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Mail,
  DollarSign,
  TrendingUp,
  Image,
  Newspaper,
  Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';

interface Stats {
  programs: number;
  achievements: number;
  news: number;
  gallery: number;
  contacts: number;
  donations: number;
  donationAmount: number;
  leaders: number;
  staff: number;
  volunteers: number;
  partners: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        programs,
        achievements,
        news,
        gallery,
        contacts,
        donations,
        leaders,
        staff,
        volunteers,
        partners,
      ] = await Promise.all([
        (supabase.from('programs') as any).select('id', { count: 'exact', head: true }),
        (supabase.from('achievements') as any).select('id', { count: 'exact', head: true }),
        (supabase.from('news') as any).select('id', { count: 'exact', head: true }),
        (supabase.from('gallery') as any).select('id', { count: 'exact', head: true }),
        (supabase.from('contact_submissions') as any).select('id', { count: 'exact', head: true }),
        (supabase.from('donations') as any).select('amount'),
        (supabase.from('leadership') as any).select('id', { count: 'exact', head: true }),
        (supabase.from('staff') as any).select('id', { count: 'exact', head: true }).eq('is_active', true),
        (supabase.from('volunteers') as any).select('id', { count: 'exact', head: true }).eq('is_active', true),
        (supabase.from('partners') as any).select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const totalDonations = donations.data?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0;

      setStats({
        programs: programs.count || 0,
        achievements: achievements.count || 0,
        news: news.count || 0,
        gallery: gallery.count || 0,
        contacts: contacts.count || 0,
        donations: donations.data?.length || 0,
        donationAmount: totalDonations,
        leaders: leaders.count || 0,
        staff: staff.count || 0,
        volunteers: volunteers.count || 0,
        partners: partners.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const statCards = [
    {
      name: 'Staff Members',
      value: stats?.staff || 0,
      icon: Users,
      color: 'bg-blue-800',
      link: '/admin/staff',
    },
    {
      name: 'Volunteers',
      value: stats?.volunteers || 0,
      icon: Users,
      color: 'bg-green-800',
      link: '/admin/volunteers',
    },
    {
      name: 'Partners',
      value: stats?.partners || 0,
      icon: Users,
      color: 'bg-purple-800',
      link: '/admin/partners',
    },
    {
      name: 'Total Programs',
      value: stats?.programs || 0,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/programs',
    },
    {
      name: 'Achievements',
      value: stats?.achievements || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/admin/achievements',
    },
    {
      name: 'News Articles',
      value: stats?.news || 0,
      icon: Newspaper,
      color: 'bg-purple-500',
      link: '/admin/news',
    },
    {
      name: 'Gallery Images',
      value: stats?.gallery || 0,
      icon: Image,
      color: 'bg-pink-500',
      link: '/admin/gallery',
    },
    {
      name: 'Contact Submissions',
      value: stats?.contacts || 0,
      icon: Mail,
      color: 'bg-yellow-500',
      link: '/admin/contacts',
    },
    {
      name: 'Total Donations',
      value: stats?.donations || 0,
      icon: DollarSign,
      color: 'bg-indigo-500',
      link: '/admin/donations',
    },
    {
      name: 'Donation Amount',
      value: formatCurrency(stats?.donationAmount || 0),
      icon: DollarSign,
      color: 'bg-teal-500',
      link: '/admin/donations',
    },
    {
      name: 'Leadership Team',
      value: stats?.leaders || 0,
      icon: Users,
      color: 'bg-orange-500',
      link: '/admin/leadership',
    },
  ];

  const quickActions = [
    { name: 'Add Program', href: '/admin/programs', icon: FileText, color: 'bg-blue-600' },
    { name: 'Upload to Gallery', href: '/admin/gallery', icon: Image, color: 'bg-purple-600' },
    { name: 'Create News', href: '/admin/news', icon: Newspaper, color: 'bg-green-600' },
    { name: 'Add Leader', href: '/admin/leadership', icon: Users, color: 'bg-orange-600' },
    // Admin management buttons
    { name: 'Manage Staff', href: '/admin/staff', icon: Users, color: 'bg-blue-800' },
    { name: 'Manage Volunteers', href: '/admin/volunteers', icon: Users, color: 'bg-green-800' },
    { name: 'Manage Partners', href: '/admin/partners', icon: Users, color: 'bg-purple-800' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your organization.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`${action.color} text-white rounded-lg p-6 hover:opacity-90 transition-opacity`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <p className="font-semibold">{action.name}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Activity tracking coming soon</p>
        </div>
      </div>

      {/* Site Preview Link */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">View Your Website</h3>
            <p className="text-blue-100">See how your site looks to visitors</p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Preview Site
          </a>
        </div>
      </div>
    </div>
  );
}

