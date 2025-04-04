import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              SatStack
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              The simplest way to track your Bitcoin transactions and calculate taxes using FIFO method.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/login"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Sign up
              </Link>
            </div>
            
            <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Development Mode Active</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                This application is running with placeholder Supabase configuration. Use the "Development mode" checkbox
                on the login or signup forms to bypass authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
