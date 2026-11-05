import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Private Pilot Ground School
      </h1>
      <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
        Learn by doing. Manipulate a model, see what happens, then answer questions using what you
        observed — not what you memorized.
      </p>
      <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
        Study aid only — not an FAA-approved course and not a substitute for a CFI. See the{' '}
        <Link to="/privacy" className="underline">
          privacy page
        </Link>{' '}
        for details.
      </p>
      <Link
        to="/modules"
        className="inline-block rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
      >
        Browse modules
      </Link>
    </div>
  )
}
