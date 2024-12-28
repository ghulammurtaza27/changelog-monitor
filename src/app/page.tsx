import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 max-w-5xl pt-16 pb-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Changelog Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Generate comprehensive changelogs for your projects automatically. 
            Track changes, identify breaking updates, and keep your users informed.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/generate" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white 
                rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Generate Changelog
            </Link>
            <Link 
              href="/view" 
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 
                rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              View Changelogs
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered Analysis
            </h3>
            <p className="text-gray-600">
              Automatically categorize changes and identify breaking updates using AI.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Customizable Output
            </h3>
            <p className="text-gray-600">
              Filter changes by type, date range, and more to create targeted changelogs.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Time-Saving
            </h3>
            <p className="text-gray-600">
              Generate changelogs in seconds instead of spending hours on manual tracking.
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} AI Changelog Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

