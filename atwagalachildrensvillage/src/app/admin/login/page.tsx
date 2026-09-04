'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { hashPassword } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setAdmin, showNotification } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      // Development superadmin bypass (remove in production)
      const isDevelopmentSuperadmin = 
        data.email === 'abdulssekyanzi@gmail.com' && 
        data.password === 'Su4at3#0';

      if (isDevelopmentSuperadmin) {
        // Bypass authentication for development superadmin
        setAdmin({
          id: 'dev-superadmin-001',
          email: 'abdulssekyanzi@gmail.com',
          fullName: 'System Developer',
          imageUrl: undefined,
        });

        showNotification('Development Superadmin Login Successful!', 'success');
        navigate('/admin/dashboard');
        return;
      }

      // Hash the password to compare
      const passwordHash = await hashPassword(data.password);

      // Query admin with matching email and password
      const { data: admin, error } = await (supabase
        .from('admins') as any)
        .select('id, email, full_name, image_url')
        .eq('email', data.email)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !admin) {
        showNotification('Invalid email or password', 'error');
        return;
      }

      // Set admin in store
      setAdmin({
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        imageUrl: admin.image_url || undefined,
      });

      showNotification('Login successful! Welcome back.', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to main site
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Development credentials:</p>
          <p className="font-mono mt-1">Email: abdulssekyanzi@gmail.com</p>
          <p className="font-mono">Password: Su4at3#0</p>
        </div>
      </div>
    </div>
  );
}

