import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="mb-2 text-5xl font-bold text-slate-200 dark:text-slate-800">404</p>
      <h1 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Page not found
      </h1>
      <Link to="/" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
        Back to home
      </Link>
    </div>
  )
}
