'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session) {
      loadData();
    }
  }, [session, status, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch apps
      const appsRes = await fetch('/api/apps', {
        headers: {
          'x-user-id': (session?.user as any)?.id || '',
        },
      });
      
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApps(appsData);
      }
      
      // Fetch builds
      const buildsRes = await fetch('/api/builds', {
        headers: {
          'x-user-id': (session?.user as any)?.id || '',
        },
      });
      
      if (buildsRes.ok) {
        const buildsData = await buildsRes.json();
        setBuilds(buildsData);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Apple Newton
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {(session.user as any)?.isAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Admin Dashboard
                </Link>
              )}
              <span className="text-gray-700 dark:text-gray-300">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Apps</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {apps.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Builds</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {builds.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Builds</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {builds.filter(b => ['pending', 'building', 'awaiting_review'].includes(b.status)).length}
            </div>
          </div>
        </div>

        {/* Apps Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Apps
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              + New App
            </button>
          </div>
          
          {apps.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p className="text-lg mb-2">No apps yet</p>
              <p className="text-sm">Connect a GitHub repository to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {app.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {app.bundleIdentifier}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        📁 {app.githubOwner}/{app.githubRepo}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      New Build
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Builds */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Builds
          </h2>
          
          {builds.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No builds yet
            </div>
          ) : (
            <div className="space-y-3">
              {builds.slice(0, 5).map((build) => (
                <div
                  key={build.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {build.app?.name || 'Unknown App'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {build.buildType} build • {build.status}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(build.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
