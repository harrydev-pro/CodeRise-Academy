import { Link, Outlet } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-surface">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-600 p-2.5 text-white">
            <GraduationCap size={24} />
          </div>

          <div>
            <p className="font-extrabold text-ink">
              CodeRise Academy
            </p>

            <p className="text-xs text-muted">
              Learn. Build. Grow.
            </p>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-700"
        >
          <ArrowLeft size={16} />
          Back home
        </Link>
      </header>

      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </div>
    </main>
  );
}