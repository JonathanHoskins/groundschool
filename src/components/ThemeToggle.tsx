import { useTheme } from '../app/ThemeProvider'

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
      className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    >
      {resolved === 'dark' ? (
        <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2Zm0 14.5A6.5 6.5 0 1 1 10 3.5a6.5 6.5 0 0 1 0 13Z" />
          <path d="M10 5a5 5 0 1 0 0 10A5 5 0 0 0 10 5Z" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-.464 4.95.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 1.414Zm2.12-10.607a1 1 0 0 1 0 1.414l-.706.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM17 11a1 1 0 1 0 0-2h-1a1 1 0 1 0 0 2h1Zm-7 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM5.05 6.464A1 1 0 1 0 6.465 5.05l-.708-.707a1 1 0 0 0-1.414 1.414l.707.707Zm1.414 8.486-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414ZM4 11a1 1 0 1 0 0-2H3a1 1 0 0 0 0 2h1Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  )
}
