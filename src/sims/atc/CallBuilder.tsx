import { useState } from 'react'

interface Step {
  label: string
  description: string
  options: string[]
}

const STEPS: Step[] = [
  {
    label: 'Who you are calling',
    description: 'Name the facility you want to talk to.',
    options: ['Runway City Ground', 'Runway City Tower', 'Runway City Approach'],
  },
  {
    label: 'Who you are',
    description: 'State your full callsign.',
    options: [
      'Cessna One Two Three Foxtrot Sierra',
      'Piper One Four Two Golf Alpha',
      'Skyhawk Eight Eight Niner Tango Uniform',
    ],
  },
  {
    label: 'Where you are',
    description: 'Give your current position on the airport.',
    options: ['FBO ramp', 'Runway City hangar area', 'Runway One Eight hold short'],
  },
  {
    label: 'What you want',
    description: 'State your request clearly and completely.',
    options: [
      'taxi to Runway One Eight, VFR departure to the north',
      'taxi to Runway Three Six, VFR departure',
      'taxi to Runway Two Seven, touch-and-go practice',
    ],
  },
]

const ATC_RESPONSES: string[] = [
  'Cessna One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway One Eight via Alpha, hold short of Runway Zero Nine Two Seven, altimeter two niner niner two.',
  'Cessna One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway Three Six via Bravo, hold short of Runway One Eight, altimeter two niner eight eight.',
  'Cessna One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway Two Seven via Charlie, hold short of Runway One Eight, touch-and-go approved.',
]

const READBACK_HIGHLIGHTS = [
  ['Runway One Eight', 'hold short of Runway Zero Nine Two Seven'],
  ['Runway Three Six', 'hold short of Runway One Eight'],
  ['Runway Two Seven', 'hold short of Runway One Eight'],
]

const COMMON_MISTAKES = [
  {
    wrong: '"Uh, yeah, hi, this is Cessna 123…"',
    right: 'Get straight to the point. No "uh", no "hi", no "this is". Start with the facility name.',
  },
  {
    wrong: '"Ground, Cessna 123, with you on the ramp."',
    right: '"With you" is filler and adds no information. State your position, not that you are "with" them.',
  },
  {
    wrong: 'Not reading back the runway or hold-short instruction.',
    right: 'Always read back runway assignments and hold-short instructions — it is required by the FARs.',
  },
  {
    wrong: 'Saying "nine" instead of "niner".',
    right: 'Aviation uses "niner" for 9 to avoid confusion with the German word "nein" (no).',
  },
]

export function CallBuilder() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [selections, setSelections] = useState<string[]>([])
  const [complete, setComplete] = useState<boolean>(false)

  const step = STEPS[currentStep]

  function selectOption(option: string) {
    const updated = [...selections, option]
    setSelections(updated)
    if (updated.length === STEPS.length) setComplete(true)
    else setCurrentStep(currentStep + 1)
  }

  function reset() { setCurrentStep(0); setSelections([]); setComplete(false) }

  const fullCall = complete
    ? `${selections[0]}, ${selections[1]}, ${selections[2]}, request ${selections[3]}.`
    : ''
  const requestIndex = complete ? STEPS[3].options.indexOf(selections[3]) : -1
  const atcResponse = requestIndex >= 0 ? ATC_RESPONSES[requestIndex] : ''
  const highlights = requestIndex >= 0 ? READBACK_HIGHLIGHTS[requestIndex] : []

  return (
    <div className="my-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Build Your First Radio Call
        </h3>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          A standard VFR call has four parts. Build yours step by step.
        </p>
      </div>

      <div className="p-6">
        {!complete ? (
          <>
            <div className="mb-5 flex items-center gap-1">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-1">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      i < currentStep
                        ? 'bg-green-500 text-white'
                        : i === currentStep
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-6 ${i < currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Part {currentStep + 1} of {STEPS.length}
            </p>
            <p className="mb-1 text-base font-medium text-slate-900 dark:text-slate-100">
              {step.label}
            </p>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {step.description}
            </p>

            {selections.length > 0 && (
              <div className="mb-4 rounded-md bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {selections.join(', ')},{'  '}
                <span className="animate-pulse text-sky-500">|</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {step.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(option)}
                  className="rounded-md border border-slate-200 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-600 dark:hover:bg-sky-950/30"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">How it sounds</p>
            <blockquote className="mb-5 rounded-md border-l-4 border-sky-500 bg-sky-50 px-4 py-3 font-mono text-sm text-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
              {fullCall}
            </blockquote>

            {atcResponse && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Likely ATC response</p>
                <blockquote className="mb-2 rounded-md border-l-4 border-amber-400 bg-amber-50 px-4 py-3 font-mono text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  {atcResponse}
                </blockquote>
                {highlights.length > 0 && (
                  <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Read back required:</span>{' '}
                    {highlights.join(' and ')}.
                  </p>
                )}
              </>
            )}

            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:text-slate-300"
            >
              Reset
            </button>
          </>
        )}

        <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Common mistakes</p>
          <ul className="space-y-3">
            {COMMON_MISTAKES.map((m) => (
              <li key={m.wrong} className="text-sm">
                <span className="font-mono text-red-600 dark:text-red-400">{m.wrong}</span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">{m.right}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
