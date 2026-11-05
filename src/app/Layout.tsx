import { Link, Outlet } from 'react-router-dom'
import { Disclaimer } from '../components/Disclaimer'
import { ThemeToggle } from '../components/ThemeToggle'

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <Link
          to="/"
          className="mr-auto text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          ✈ Groundschool
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/modules"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Modules
          </Link>
          <Link
            to="/privacy"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Privacy
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Disclaimer />
    </div>
  )
}
