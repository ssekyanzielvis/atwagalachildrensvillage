'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Dashboard Error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard Error</h1>
                <p className="text-red-100 mt-1">
                  An unexpected error occurred in the admin panel
                </p>
              </div>
            </div>
          </div>

          {/* Error Details */}
          <div className="p-6 space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-semibold text-red-900">Error Message</h3>
                  <p className="mt-2 text-sm text-red-800 font-mono break-words">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-red-700">
                      Error ID: <span className="font-mono">{error.digest}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Troubleshooting Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Troubleshooting Steps
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                <li>
                  Check if <strong>Supabase connection</strong> is working (verify .env.local)
                </li>
                <li>
                  Verify <strong>authentication status</strong> - you may need to log in again
                </li>
                <li>
                  Ensure <strong>database tables</strong> are created (run COMPLETE_SETUP.sql)
                </li>
                <li>
                  Check if <strong>image URLs</strong> are configured in next.config.ts
                </li>
                <li>
                  Review <strong>browser console</strong> (F12) for additional error details
                </li>
                <li>
                  Verify <strong>RLS policies</strong> are correctly set in Supabase
                </li>
              </ol>
            </div>

            {/* Stack Trace (Development Only) */}
            {process.env.NODE_ENV === 'development' && error.stack && (
              <details className="bg-gray-50 border border-gray-200 rounded-lg">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  🔍 View Technical Details (Developer Mode)
                </summary>
                <div className="p-4 border-t border-gray-200">
                  <div className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={reset}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
              <Link
                href="/admin/dashboard"
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard Home
              </Link>
              <Link
                href="/"
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Exit to Site
              </Link>
            </div>

            {/* Help Footer */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3 text-xs text-gray-600">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-700">Need More Help?</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Open browser DevTools (F12) and check the Console tab</li>
                    <li>• Review setup guides in COMPLETE_PROJECT_SETUP.md</li>
                    <li>• Verify all SQL scripts were run successfully</li>
                    <li>• Check Supabase dashboard for connection issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
