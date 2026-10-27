import { Link } from "react-router-dom";
import { ArrowUpRight, GraduationCap } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="rounded-xl bg-brand-600 p-3">
              <GraduationCap size={25} />
            </div>

            <div>
              <p className="text-lg font-extrabold">CodeRise Academy</p>
              <p className="mt-1 text-xs text-gray-400">
                Learn. Build. Grow.
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-md text-sm leading-7 text-gray-400">
            Empowering learners with practical digital skills,
            technology education, and opportunities to build
            meaningful projects.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Explore</h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
            <Link className="hover:text-white" to="/about">
              About us
            </Link>

            <Link className="hover:text-white" to="/programs">
              Academy programs
            </Link>

            <Link className="hover:text-white" to="/register">
              Create an account
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Get in touch</h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
            <Link
              className="inline-flex items-center gap-2 hover:text-white"
              to="/contact"
            >
              Contact us
              <ArrowUpRight size={15} />
            </Link>

            <p>Support details will be added here.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-gray-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} CodeRise Academy.
            All rights reserved.
          </p>

          <p>Learn. Build. Grow.</p>
        </div>
      </div>
    </footer>
  );
}