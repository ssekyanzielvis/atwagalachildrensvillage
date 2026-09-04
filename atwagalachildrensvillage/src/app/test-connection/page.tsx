'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    // Test 1: Environment variables
    results.env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
    };

    // Test 2: Supabase client
    try {
      const { data, error } = await (supabase.from('admins') as any).select('count');
      results.supabaseClient = error 
        ? `❌ Error: ${error.message}` 
        : '✅ Connected';
      results.supabaseDetails = error ? error : data;
    } catch (err: any) {
      results.supabaseClient = `❌ Exception: ${err.message}`;
    }

    // Test 3: Check admins table
    try {
      const { data, error, count } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true });
      
      results.adminsTable = error
        ? `❌ Error: ${error.message}`
        : `✅ Found ${count} admin(s)`;
    } catch (err: any) {
      results.adminsTable = `❌ Exception: ${err.message}`;
    }

    // Test 4: Try to fetch an admin (without credentials)
    try {
      const { data, error } = await (supabase
        .from('admins') as any)
        .select('email, full_name')
        .eq('email', 'abdulssekyanzi@gmail.com')
        .single();
      
      results.fetchAdmin = error
        ? `❌ Error: ${error.message}`
        : data 
        ? `✅ Found admin: ${data.full_name} (${data.email})`
        : '⚠️ Admin not found in database';
    } catch (err: any) {
      results.fetchAdmin = `❌ Exception: ${err.message}`;
    }

    // Test 5: Test password hash function
    try {
      const { hashPassword } = await import('@/lib/utils');
      const hash = await hashPassword('admin123');
      results.passwordHash = hash 
        ? `✅ Generated hash: ${hash.substring(0, 20)}...`
        : '❌ Failed to generate hash';
    } catch (err: any) {
      results.passwordHash = `❌ Exception: ${err.message}`;
    }

    setStatus(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Connection Test</h1>
          <p className="text-gray-600 mb-6">
            Test your Supabase connection and database setup
          </p>

          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
          >
            {loading ? 'Running Tests...' : 'Run Connection Tests'}
          </button>

          {Object.keys(status).length > 0 && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
                
                {Object.entries(status).map(([key, value]) => (
                  <div key={key} className="mb-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold text-lg mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </h3>
                    <pre className="text-sm overflow-auto p-2 bg-white rounded border">
                      {typeof value === 'object' 
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </pre>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="font-semibold text-lg mb-2">Next Steps:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    If you see "relation 'admins' does not exist" → 
                    <strong> Run COMPLETE_SETUP.sql</strong> in Supabase SQL Editor
                  </li>
                  <li>
                    If admin count is 0 → 
                    <strong> Create an admin</strong> using COMPLETE_SETUP.sql or manually
                  </li>
                  <li>
                    If connection fails → 
                    <strong> Check .env.local</strong> has correct Supabase credentials
                  </li>
                  <li>
                    If everything is ✅ → 
                    <strong> Try logging in</strong> at{' '}
                    <a href="/admin/login" className="text-blue-600 hover:underline">
                      /admin/login
                    </a>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="font-semibold text-lg mb-2">Quick Links:</h3>
                <div className="space-x-4">
                  <a
                    href="/admin/login"
                    className="text-blue-600 hover:underline"
                  >
                    Admin Login →
                  </a>
                  <a
                    href="https://app.supabase.com/project/qvdacaasudthvrsqiwcz/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Supabase SQL Editor →
                  </a>
                  <a
                    href="https://app.supabase.com/project/qvdacaasudthvrsqiwcz/editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Supabase Table Editor →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <span>ℹ️</span> Setup Checklist
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Ensure <code className="bg-white px-2 py-1 rounded">.env.local</code> exists with Supabase credentials</li>
            <li>Run <code className="bg-white px-2 py-1 rounded">COMPLETE_SETUP.sql</code> in Supabase SQL Editor</li>
            <li>Verify database setup with <code className="bg-white px-2 py-1 rounded">QUICK_VERIFY.sql</code></li>
            <li>Run this connection test to confirm everything works</li>
            <li>Try logging in with your admin credentials</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
