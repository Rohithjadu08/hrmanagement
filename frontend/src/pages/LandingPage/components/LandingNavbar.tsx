import { BoltIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 shadow-soft ring-1 ring-white/10">
            <BoltIcon className="h-5 w-5 text-amber2" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-offwhite">Reckon</div>
            <div className="text-xs text-white/60">Group of Company</div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a className="hover:text-offwhite transition" href="#features">
            Features
          </a>
          <a className="hover:text-offwhite transition" href="#how">
            How it works
          </a>
          <a className="hover:text-offwhite transition" href="#faq">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-offwhite/90 hover:bg-white/10 transition"
          >
            Talk to HR Bot
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-offwhite/90 hover:bg-white/10 transition"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-amber2 px-4 py-2 text-sm font-semibold text-ink shadow-soft hover:opacity-95 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* small screens: keep a single accent CTA */}
          <Link
            to="/signup"
            className="sm:hidden rounded-xl bg-amber2 px-4 py-2 text-sm font-semibold text-ink shadow-soft hover:opacity-95 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  )
}


