import { useState } from 'react'

interface QuestionCardProps {
  id: string
  prompt: string
  choices: string[]
  answer: string
  explanation: string
  sources?: Array<{ doc: string; ref: string }>
}

type State = 'unanswered' | 'correct' | 'wrong'

export function QuestionCard({ id, prompt, choices, answer, explanation, sources }: QuestionCardProps) {
  const [state, setState] = useState<State>('unanswered')
  const [selected, setSelected] = useState<string | null>(null)

  function choose(choice: string) {
    if (state !== 'unanswered') return
    setSelected(choice)
    setState(choice === answer ? 'correct' : 'wrong')
  }

  function reset() {
    setState('unanswered')
    setSelected(null)
  }

  return (
    <div
      role="group"
      aria-labelledby={`${id}-prompt`}
      className="my-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <p id={`${id}-prompt`} className="mb-3 font-medium text-slate-900 dark:text-slate-100">
        {prompt}
      </p>
      <ul className="space-y-2">
        {choices.map((choice) => {
          const isSelected = selected === choice
          const isAnswer = choice === answer
          let chipClass =
            'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors '
          if (state === 'unanswered') {
            chipClass +=
              'border-slate-200 hover:border-sky-500 hover:bg-sky-50 dark:border-slate-700 dark:hover:border-sky-700 dark:hover:bg-sky-950/30'
          } else if (isAnswer) {
            chipClass += 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
          } else if (isSelected) {
            chipClass += 'border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
          } else {
            chipClass += 'border-slate-200 opacity-50 dark:border-slate-700'
          }

          return (
            <li key={choice}>
              <button
                type="button"
                className={chipClass}
                onClick={() => choose(choice)}
                disabled={state !== 'unanswered'}
                aria-pressed={isSelected}
                aria-describedby={state !== 'unanswered' ? `${id}-explanation` : undefined}
              >
                {choice}
                {state !== 'unanswered' && isAnswer && (
                  <span aria-hidden="true" className="ml-2">
                    ✓
                  </span>
                )}
                {state !== 'unanswered' && isSelected && !isAnswer && (
                  <span aria-hidden="true" className="ml-2">
                    ✗
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {state !== 'unanswered' && (
        <div id={`${id}-explanation`} className="mt-4">
          <p
            className={`mb-2 text-sm font-semibold ${
              state === 'correct'
                ? 'text-green-700 dark:text-green-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {state === 'correct' ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{explanation}</p>
          {sources && sources.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Source: {sources.map((s) => `${s.doc} ${s.ref}`).join('; ')}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-xs text-sky-600 hover:underline dark:text-sky-400"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
