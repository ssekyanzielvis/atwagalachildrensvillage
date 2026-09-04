'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console with details
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
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
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-600">An error occurred while loading this page</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-red-900 mb-2">Error Details:</h2>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-red-800">Message:</span>
              <p className="text-sm text-red-700 mt-1 font-mono break-words">
                {error.message}
              </p>
            </div>
            {error.digest && (
              <div>
                <span className="text-xs font-medium text-red-800">Error ID:</span>
                <p className="text-sm text-red-700 mt-1 font-mono">{error.digest}</p>
              </div>
            )}
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
              Stack Trace (Development Only)
            </summary>
            <div className="bg-gray-100 border border-gray-300 rounded p-3 overflow-x-auto">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                {error.stack}
              </pre>
            </div>
          </details>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Common causes and solutions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>
              <strong>Image loading error:</strong> Check that the image URL is accessible and 
              configured in <code className="bg-gray-100 px-1 py-0.5 rounded">next.config.ts</code>
            </li>
            <li>
              <strong>Database connection:</strong> Verify Supabase credentials in 
              <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code>
            </li>
            <li>
              <strong>Missing data:</strong> Ensure required data exists in the database
            </li>
            <li>
              <strong>API error:</strong> Check browser console and network tab for details
            </li>
          </ul>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={reset}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            If this error persists, please check the browser console (F12) for more details
          </p>
        </div>
      </div>
    </div>
  );
}
