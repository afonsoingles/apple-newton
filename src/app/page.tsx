import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Apple Newton
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Build and distribute iOS apps via TestFlight
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Welcome to Apple Newton
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Apple Newton is a platform for building and distributing iOS apps
              to TestFlight. Connect your GitHub repository and start building
              your Expo apps today.
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  🚀 Development Builds
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quick development builds with <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.dev-build</code> suffix. No verification required.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  📦 Production Builds
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Production-ready builds with admin review for safety and quality assurance.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  ⚙️ Custom Builds
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your EAS configuration to fit your specific build needs.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Login with HCA OAuth</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Connect your GitHub account and repository</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>We extract app information from your app.json</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Select your build type (Development, Production, or Custom)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">5.</span>
                <span>Build is compiled using EAS and uploaded to App Store Connect</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">6.</span>
                <span>After Apple's review, your app is published to TestFlight</span>
              </li>
            </ol>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/auth/signin"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
