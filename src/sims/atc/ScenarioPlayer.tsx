import { useMemo, useState, useEffect } from 'react'
import { ScenarioSchema } from '../../engines/schemas'
import rawScenario from '../../../data/scenarios/teach1-vfr-departure.json'
import {
  createSession, currentStep, requiresInput, advance, submit,
  stepCount, stepIndex,
  type ScenarioSession, type StepRecord,
} from '../../engines/scenario'
import type { GradeResult } from '../../engines/readback'

const scenario = ScenarioSchema.parse(rawScenario)

// ── Frequency display map ────────────────────────────────────────────────────

const FREQ_INFO: Record<string, { label: string; mhz: string; color: string }> = {
  ATIS: { label: 'ATIS',      mhz: '118.05', color: 'text-sky-400' },
  GND:  { label: 'Ground',    mhz: '121.6',  color: 'text-green-400' },
  TWR:  { label: 'Tower',     mhz: '118.4',  color: 'text-amber-400' },
  DEP:  { label: 'Departure', mhz: '124.0',  color: 'text-purple-400' },
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface GradeFeedbackProps {
  grade: GradeResult
  passed: boolean
  pilotInput: string
  example: string
  onContinue: () => void
  onRetry: () => void
}

function GradeFeedback({ grade, passed, pilotInput, example, onContinue, onRetry }: GradeFeedbackProps) {
  const pct = grade.present.length + grade.missing.length
  const bannerClass = passed
    ? 'rounded-md bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 p-3'
    : grade.score >= 0.3
    ? 'rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 p-3'
    : 'rounded-md bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-700 p-3'
  const scoreColor = passed
    ? 'font-semibold text-green-700 dark:text-green-300'
    : grade.score >= 0.3
    ? 'font-semibold text-amber-700 dark:text-amber-300'
    : 'font-semibold text-red-700 dark:text-red-300'

  return (
    <div aria-live="polite">
      <div className={bannerClass}>
        <p className={scoreColor}>
          {grade.present.length}/{pct} items correct
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{grade.feedback}</p>

        {grade.present.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {grade.present.map((item, i) => (
              <span
                key={i}
                className="rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs text-green-800 dark:text-green-200"
              >
                ✓ {item.kind}
              </span>
            ))}
          </div>
        )}

        {grade.missing.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {grade.missing.map((item, i) => (
              <span
                key={i}
                className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200"
              >
                ✗ {item.hint}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs text-slate-400 uppercase tracking-wide">Your transmission</p>
        <p className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-700 dark:text-slate-300">
          {pilotInput}
        </p>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs text-slate-400 uppercase tracking-wide">Example answer</p>
        <p className="rounded bg-sky-50 dark:bg-sky-950/30 px-3 py-2 font-mono text-sm text-sky-800 dark:text-sky-200">
          {example}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {passed ? (
          <button
            type="button"
            onClick={onContinue}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Continue →
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              Skip →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── CompletionScreen ─────────────────────────────────────────────────────────

interface CompletionScreenProps {
  history: StepRecord[]
  onRestart: () => void
}

function CompletionScreen({ history, onRestart }: CompletionScreenProps) {
  const graded = history.filter((r) => r.grade !== null)
  const passedCount = graded.filter((r) => r.passed).length

  function formatStepId(id: string): string {
    return id
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="py-4 text-center">
      <p className="text-3xl" aria-hidden="true">✈</p>
      <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        Scenario Complete
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {passedCount}/{graded.length} graded steps passed
      </p>

      {graded.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 text-left">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 text-left">Step</th>
                <th className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {graded.map((r) => (
                <tr key={r.stepId}>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                    {formatStepId(r.stepId)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={
                        r.passed
                          ? 'text-green-600 dark:text-green-400 font-medium'
                          : 'text-red-600 dark:text-red-400 font-medium'
                      }
                    >
                      {r.grade ? `${Math.round(r.grade.score * 100)}%` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-5 rounded-md bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        Fly Again
      </button>
    </div>
  )
}

// ── HistoryItem ───────────────────────────────────────────────────────────────

function HistoryItem({ record }: { record: StepRecord }) {
  function formatStepId(id: string): string {
    return id
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const truncated =
    record.pilotInput && record.pilotInput.length > 60
      ? record.pilotInput.slice(0, 60) + '…'
      : record.pilotInput

  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-slate-100 dark:border-slate-800 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {formatStepId(record.stepId)}
        </p>
        {truncated && (
          <p className="mt-0.5 truncate font-mono text-xs text-slate-700 dark:text-slate-300">
            {truncated}
          </p>
        )}
      </div>
      {record.grade !== null && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            record.passed
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
          }`}
        >
          {Math.round(record.grade.score * 100)}%
        </span>
      )}
    </div>
  )
}

// ── ScenarioPlayer ────────────────────────────────────────────────────────────

export function ScenarioPlayer() {
  const [session, setSession] = useState<ScenarioSession>(() => createSession(scenario))
  const [phase, setPhase] = useState<'atc' | 'input' | 'graded'>('atc')
  const [pilotInput, setPilotInput] = useState('')
  const [currentGrade, setCurrentGrade] = useState<GradeResult | null>(null)
  const [currentPassed, setCurrentPassed] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const step = useMemo(() => {
    if (session.complete) return null
    return currentStep(scenario, session)
  }, [session])

  // ── TTS ─────────────────────────────────────────────────────────────────────

  function speak(text: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.88
    utterance.pitch = 0.85
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => v.lang.startsWith('en') && /male/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith('en-US')) ??
      voices[0]
    if (preferred) utterance.voice = preferred
    utterance.onend = () => { setIsSpeaking(false); onEnd?.() }
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Auto-play ATC when step changes
  useEffect(() => {
    if (!step) return
    if (step.atc) {
      setPhase('atc')
      speak(step.atc)
    } else if (requiresInput(step)) {
      setPhase('input')
    } else {
      // No ATC and no pilot — advance automatically
      setSession((prev) => advance(scenario, prev))
    }
    setPilotInput('')
    setCurrentGrade(null)
    setCurrentPassed(false)
    setShowExample(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.currentStepId])

  // Stop speaking on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel()
  }, [])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleAtcContinue() {
    if (!step) return
    if (requiresInput(step)) {
      setPhase('input')
    } else {
      setSession((prev) => advance(scenario, prev))
    }
  }

  function handleSubmit() {
    if (!step || !pilotInput.trim()) return
    const result = submit(scenario, session, pilotInput)
    setSession(result.session)
    setCurrentGrade(result.grade)
    setCurrentPassed(result.passed)
    setPhase('graded')
  }

  function handleGradedContinue() {
    // session already advanced by submit(); determine new phase
    if (session.complete) return
    const newStep = currentStep(scenario, session)
    if (newStep.atc) {
      setPhase('atc')
    } else if (requiresInput(newStep)) {
      setPhase('input')
    }
    setPilotInput('')
    setCurrentGrade(null)
    setCurrentPassed(false)
    setShowExample(false)
  }

  function handleRetry() {
    setPilotInput('')
    setPhase('input')
    setShowExample(false)
  }

  function handleRestart() {
    window.speechSynthesis.cancel()
    setSession(createSession(scenario))
    setPilotInput('')
    setCurrentGrade(null)
    setCurrentPassed(false)
    setShowExample(false)
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const totalSteps = stepCount(scenario)
  const currentIndex = session.complete ? totalSteps : stepIndex(scenario, session)
  const progress = Math.round(((currentIndex) / totalSteps) * 100)

  const freqKind = step?.frequency ?? 'DEP'
  const freq = FREQ_INFO[freqKind] ?? { label: freqKind, mhz: '—', color: 'text-slate-400' }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <figure
      aria-label="ATC scenario simulator"
      className="not-prose rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">
            Step {currentIndex + 1} of {totalSteps}
          </span>
          <div className="mt-0.5 h-1.5 w-32 rounded bg-slate-200 dark:bg-slate-700">
            <div
              className="h-1.5 rounded bg-sky-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Frequency</span>
          <p className={`${freq.color} font-mono font-bold`}>
            {freq.label} {freq.mhz}
          </p>
        </div>
      </div>

      {/* Complete state */}
      {session.complete ? (
        <CompletionScreen history={session.history} onRestart={handleRestart} />
      ) : step !== null && (
        <>
          {/* ATC block */}
          {step.atc && (
            <div className="mb-4 rounded-lg bg-slate-900 dark:bg-black/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-slate-400">ATC</span>
                <button
                  type="button"
                  onClick={() => speak(step.atc!)}
                  disabled={isSpeaking}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200"
                >
                  {isSpeaking ? '◼ Speaking...' : '▶ Play'}
                </button>
              </div>
              <p className="font-mono text-sm text-green-400 leading-relaxed">{step.atc}</p>
            </div>
          )}

          {/* ATC-only: Continue */}
          {phase === 'atc' && !requiresInput(step) && (
            <button
              type="button"
              onClick={handleAtcContinue}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-600"
            >
              Continue →
            </button>
          )}

          {/* ATC + pilot: Ready to respond */}
          {phase === 'atc' && requiresInput(step) && (
            <button
              type="button"
              onClick={() => setPhase('input')}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Ready to respond →
            </button>
          )}

          {/* Input / graded phase */}
          {(phase === 'input' || phase === 'graded') && step.pilot && (
            <div className="mt-4">
              <label
                htmlFor="pilot-input"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {step.pilot.prompt}
              </label>

              {phase === 'input' && (
                <>
                  <textarea
                    id="pilot-input"
                    value={pilotInput}
                    onChange={(e) => setPilotInput(e.target.value)}
                    placeholder="Type your transmission here..."
                    rows={3}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 p-2 font-mono text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!pilotInput.trim()}
                      className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExample(!showExample)}
                      className="rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500"
                    >
                      {showExample ? 'Hide example' : 'Show example'}
                    </button>
                  </div>
                  {showExample && (
                    <p className="mt-2 rounded bg-sky-50 dark:bg-sky-950/30 p-2 font-mono text-sm text-sky-800 dark:text-sky-200">
                      Example: {step.pilot.example}
                    </p>
                  )}
                </>
              )}

              {phase === 'graded' && currentGrade && (
                <GradeFeedback
                  grade={currentGrade}
                  passed={currentPassed}
                  pilotInput={pilotInput}
                  example={step.pilot.example}
                  onContinue={handleGradedContinue}
                  onRetry={handleRetry}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* History accordion */}
      {session.history.length > 0 && !session.complete && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            Session log ({session.history.length} exchanges)
          </summary>
          <div className="mt-2 space-y-2">
            {session.history.map((r) => (
              <HistoryItem key={r.stepId} record={r} />
            ))}
          </div>
        </details>
      )}
    </figure>
  )
}
