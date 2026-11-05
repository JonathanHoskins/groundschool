import type { ReactNode } from 'react'

interface LessonLayoutProps {
  title: string
  acsRefs?: string[]
  sources?: Array<{ doc: string; ref: string }>
  children: ReactNode
}

export function LessonLayout({ title, acsRefs = [], sources = [], children }: LessonLayoutProps) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {acsRefs.length > 0 && (
          <p className="text-xs text-slate-400">
            ACS:{' '}
            {acsRefs.map((code, i) => (
              <span key={code}>
                {i > 0 && ', '}
                <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{code}</code>
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="prose prose-slate max-w-none dark:prose-invert">{children}</div>

      {sources.length > 0 && (
        <footer className="mt-10 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sources
          </p>
          <ul className="space-y-0.5 text-xs text-slate-500">
            {sources.map((s) => (
              <li key={`${s.doc}-${s.ref}`}>
                {s.doc} &mdash; {s.ref}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  )
}
