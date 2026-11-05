import { useState } from 'react'
import { AIRSPACE_DATA, getAirspaceByClass } from '../../engines/airspace'
import type { AirspaceClass } from '../../engines/airspace'

// ── Quiz data ───────────────────────────────────────────────────────────────

interface QuizItem {
  prompt: string
  choices: string[]
  answer: string
  explanation: string
}

const QUIZ_ITEMS: QuizItem[] = [
  {
    prompt: 'You want to fly VFR into Class B airspace. What do you need?',
    choices: [
      'Two-way radio contact with ATC',
      'An ATC clearance',
      'A filed flight plan',
      'Only a transponder',
    ],
    answer: 'An ATC clearance',
    explanation:
      "Class B requires an explicit ATC clearance to enter — not just radio contact. You must receive the words 'cleared into the Class Bravo airspace.'",
  },
  {
    prompt: 'What is the minimum flight visibility for VFR flight in Class D airspace?',
    choices: ['1 statute mile', '2 statute miles', '3 statute miles', '5 statute miles'],
    answer: '3 statute miles',
    explanation:
      'Class D VFR minimum visibility is 3 statute miles. Cloud clearance is 500 ft below, 1,000 ft above, 2,000 ft horizontal.',
  },
  {
    prompt:
      'Class G airspace below 1,200 ft AGL during the day requires what minimum visibility?',
    choices: [
      '1 statute mile, clear of clouds',
      '3 statute miles, 500/1000/2000',
      '1 statute mile, 500/1000/2000',
      '5 statute miles, 1000/1000/1 mile',
    ],
    answer: '1 statute mile, clear of clouds',
    explanation:
      'Class G below 1,200 ft AGL during the day has the most permissive VFR minimums: 1 statute mile visibility and simply clear of clouds.',
  },
  {
    prompt: 'Above 10,000 ft MSL in Class E airspace, the VFR cloud clearance requirement is:',
    choices: [
      '500 ft below, 1,000 ft above, 2,000 ft horizontal',
      '1,000 ft below, 1,000 ft above, 1 mile horizontal',
      '1,000 ft below, 500 ft above, 2,000 ft horizontal',
      'Clear of clouds',
    ],
    answer: '1,000 ft below, 1,000 ft above, 1 mile horizontal',
    explanation:
      'At and above 10,000 ft MSL, the cloud clearance increases to 1,000/1,000/1 mile regardless of airspace class (except A). The visibility minimum also increases to 5 statute miles.',
  },
  {
    prompt:
      'Which airspace class requires IFR operations only — VFR flight is not permitted?',
    choices: ['Class B', 'Class C', 'Class A', 'Class D'],
    answer: 'Class A',
    explanation:
      'Class A airspace (18,000 ft MSL and above, to FL600) is IFR only. All aircraft must be on an IFR flight plan with an ATC clearance. VFR flight is not permitted.',
  },
]

// ── SVG cross-section diagram ───────────────────────────────────────────────

// Diagram coordinate system: Y=0 is top, Y=360 is ground.
// Altitude reference points (not to scale — stylized for clarity):
//   FL600 / Class A top  → Y=0
//   FL180 / Class A base → Y=50
//   10,000 ft (Class B)  → Y=140
//   4,000 ft (Class C)   → Y=210
//   2,500 ft (Class D)   → Y=255
//   1,200 ft (Class E/G) → Y=305
//   Ground (surface)     → Y=360

const SVG_W = 500
const SVG_H = 400

// Y positions for key altitudes
const Y = {
  classATop: 0,
  classABase: 50,     // FL180
  classB: 140,        // 10,000 ft
  classC: 210,        // 4,000 ft
  classD: 255,        // 2,500 ft
  classE: 305,        // 1,200 ft (Class E starts, G below)
  ground: 360,
}

// Aircraft icon position per selected class (cx, cy)
const AIRCRAFT_POS: Record<AirspaceClass, [number, number]> = {
  A: [250, 25],
  B: [250, 95],
  C: [220, 180],
  D: [160, 232],
  E: [280, 282],
  G: [280, 335],
}

interface DiagramProps {
  selected: AirspaceClass
  onSelect: (cls: AirspaceClass) => void
}

function AirspaceDiagram({ selected, onSelect }: DiagramProps) {
  const [hovered, setHovered] = useState<AirspaceClass | null>(null)

  function regionOpacity(cls: AirspaceClass) {
    if (selected === cls) return 0.55
    if (hovered === cls) return 0.4
    return 0.22
  }

  function strokeWidth(cls: AirspaceClass) {
    return selected === cls ? 2.5 : 1.5
  }

  const [acX, acY] = AIRCRAFT_POS[selected]

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      aria-label="Airspace cross-section diagram. Click a region or use the class buttons below to select a class."
      role="img"
      className="w-full max-w-lg rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    >
      {/* ── Altitude axis labels ── */}
      <text x="4" y={Y.classABase + 4}  fontSize="9" fill="currentColor" className="text-slate-400 fill-slate-400">FL180</text>
      <text x="4" y={Y.classB + 4}      fontSize="9" fill="currentColor" className="text-slate-400 fill-slate-400">10,000</text>
      <text x="4" y={Y.classC + 4}      fontSize="9" fill="currentColor" className="text-slate-400 fill-slate-400">4,000</text>
      <text x="4" y={Y.classD + 4}      fontSize="9" fill="currentColor" className="text-slate-400 fill-slate-400">2,500</text>
      <text x="4" y={Y.classE + 4}      fontSize="9" fill="currentColor" className="text-slate-400 fill-slate-400">1,200</text>
      <text x="4" y={Y.ground + 4}      fontSize="9" fill="currentColor" className="text-slate-400 fill-slate-400">SFC</text>
      <text x="4" y="12"                fontSize="9" fill="currentColor" className="text-slate-400 fill-slate-400">FL600</text>

      {/* ── Altitude tick lines ── */}
      {[Y.classABase, Y.classB, Y.classC, Y.classD, Y.classE, Y.ground].map((yVal) => (
        <line key={yVal} x1="38" y1={yVal} x2={SVG_W} y2={yVal} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3,3" />
      ))}

      {/* ── Class G: surface to 1,200 ft (full width) ── */}
      <rect
        x="40" y={Y.classE} width={SVG_W - 40} height={Y.ground - Y.classE}
        fill={AIRSPACE_DATA.G.color}
        fillOpacity={regionOpacity('G')}
        stroke={AIRSPACE_DATA.G.color}
        strokeWidth={strokeWidth('G')}
        role="button"
        aria-label="Class G — uncontrolled airspace. Click to select."
        aria-pressed={selected === 'G'}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect('G')}
        onMouseEnter={() => setHovered('G')}
        onMouseLeave={() => setHovered(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect('G') }}
        tabIndex={0}
      />
      <text x="470" y={Y.classE + (Y.ground - Y.classE) / 2 + 4} fontSize="11" fontWeight="bold"
        fill={AIRSPACE_DATA.G.color} textAnchor="middle" pointerEvents="none">G</text>

      {/* ── Class E: 1,200 ft to FL180 (full width, behind other classes) ── */}
      <rect
        x="40" y={Y.classABase} width={SVG_W - 40} height={Y.classE - Y.classABase}
        fill={AIRSPACE_DATA.E.color}
        fillOpacity={regionOpacity('E')}
        stroke={AIRSPACE_DATA.E.color}
        strokeWidth={strokeWidth('E')}
        role="button"
        aria-label="Class E — controlled airspace. Click to select."
        aria-pressed={selected === 'E'}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect('E')}
        onMouseEnter={() => setHovered('E')}
        onMouseLeave={() => setHovered(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect('E') }}
        tabIndex={0}
      />
      <text x="470" y={Y.classABase + (Y.classE - Y.classABase) / 2 + 4} fontSize="11" fontWeight="bold"
        fill={AIRSPACE_DATA.E.color} textAnchor="middle" pointerEvents="none">E</text>

      {/* ── Class D: surface to 2,500 ft, narrow left column ── */}
      <rect
        x="40" y={Y.classD} width={130} height={Y.ground - Y.classD}
        fill={AIRSPACE_DATA.D.color}
        fillOpacity={regionOpacity('D')}
        stroke={AIRSPACE_DATA.D.color}
        strokeWidth={strokeWidth('D')}
        role="button"
        aria-label="Class D — control tower airspace. Click to select."
        aria-pressed={selected === 'D'}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect('D')}
        onMouseEnter={() => setHovered('D')}
        onMouseLeave={() => setHovered(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect('D') }}
        tabIndex={0}
      />
      <text x="105" y={Y.classD + (Y.ground - Y.classD) / 2 + 4} fontSize="11" fontWeight="bold"
        fill={AIRSPACE_DATA.D.color} textAnchor="middle" pointerEvents="none">D</text>

      {/* ── Class C: surface to 4,000 ft, medium column ── */}
      <rect
        x="40" y={Y.classC} width={210} height={Y.ground - Y.classC}
        fill={AIRSPACE_DATA.C.color}
        fillOpacity={regionOpacity('C')}
        stroke={AIRSPACE_DATA.C.color}
        strokeWidth={strokeWidth('C')}
        role="button"
        aria-label="Class C — radar approach control airspace. Click to select."
        aria-pressed={selected === 'C'}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect('C')}
        onMouseEnter={() => setHovered('C')}
        onMouseLeave={() => setHovered(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect('C') }}
        tabIndex={0}
      />
      <text x="155" y={Y.classC + (Y.ground - Y.classC) / 2 + 4} fontSize="11" fontWeight="bold"
        fill={AIRSPACE_DATA.C.color} textAnchor="middle" pointerEvents="none">C</text>

      {/* ── Class B: surface to 10,000 ft, wide column (shelf structure) ── */}
      {/* Lower shelf: surface to 4,000 ft */}
      <rect
        x="40" y={Y.classB} width={360} height={Y.ground - Y.classB}
        fill={AIRSPACE_DATA.B.color}
        fillOpacity={regionOpacity('B')}
        stroke={AIRSPACE_DATA.B.color}
        strokeWidth={strokeWidth('B')}
        role="button"
        aria-label="Class B — major airport airspace. Click to select."
        aria-pressed={selected === 'B'}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect('B')}
        onMouseEnter={() => setHovered('B')}
        onMouseLeave={() => setHovered(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect('B') }}
        tabIndex={0}
      />
      <text x="310" y={Y.classB + (Y.ground - Y.classB) / 2 + 4} fontSize="11" fontWeight="bold"
        fill={AIRSPACE_DATA.B.color} textAnchor="middle" pointerEvents="none">B</text>

      {/* ── Class A: FL180 to FL600 (top bar) ── */}
      <rect
        x="40" y={Y.classATop} width={SVG_W - 40} height={Y.classABase - Y.classATop}
        fill={AIRSPACE_DATA.A.color}
        fillOpacity={regionOpacity('A')}
        stroke={AIRSPACE_DATA.A.color}
        strokeWidth={strokeWidth('A')}
        role="button"
        aria-label="Class A — IFR only airspace above FL180. Click to select."
        aria-pressed={selected === 'A'}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect('A')}
        onMouseEnter={() => setHovered('A')}
        onMouseLeave={() => setHovered(null)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect('A') }}
        tabIndex={0}
      />
      <text x={SVG_W / 2} y={(Y.classATop + Y.classABase) / 2 + 4} fontSize="11" fontWeight="bold"
        fill={AIRSPACE_DATA.A.color} textAnchor="middle" pointerEvents="none">A  FL180–FL600</text>

      {/* ── Dashed line at FL180 ── */}
      <line x1="40" y1={Y.classABase} x2={SVG_W} y2={Y.classABase}
        stroke={AIRSPACE_DATA.A.color} strokeWidth="1.5" strokeDasharray="6,3" />

      {/* ── Aircraft icon ── */}
      <text
        x={acX}
        y={acY}
        fontSize="16"
        textAnchor="middle"
        dominantBaseline="middle"
        aria-label={`Aircraft shown in Class ${selected} airspace`}
        style={{ userSelect: 'none', transition: 'all 0.3s ease' }}
      >
        ▲
      </text>
    </svg>
  )
}

// ── Class selector buttons ──────────────────────────────────────────────────

const CLASS_KEYS: AirspaceClass[] = ['A', 'B', 'C', 'D', 'E', 'G']

interface ClassButtonsProps {
  selected: AirspaceClass
  onSelect: (cls: AirspaceClass) => void
}

function ClassButtons({ selected, onSelect }: ClassButtonsProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Select airspace class">
      {CLASS_KEYS.map((cls) => {
        const info = AIRSPACE_DATA[cls]
        const isSelected = selected === cls
        return (
          <button
            key={cls}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(cls)}
            style={{ borderColor: info.color, color: isSelected ? '#fff' : info.color,
              backgroundColor: isSelected ? info.color : 'transparent' }}
            className="rounded-md border-2 px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {cls === 'G' ? 'G (Uncontrolled)' : `Class ${cls}`}
          </button>
        )
      })}
    </div>
  )
}

// ── Detail panel ────────────────────────────────────────────────────────────

function CheckIcon({ yes }: { yes: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={yes
        ? 'text-green-600 dark:text-green-400 font-bold'
        : 'text-red-500 dark:text-red-400 font-bold'}
    >
      {yes ? '✓' : '✗'}
    </span>
  )
}

interface DetailPanelProps {
  selected: AirspaceClass
}

function DetailPanel({ selected }: DetailPanelProps) {
  const info = getAirspaceByClass(selected)
  const vfrDay = info.vfrMinimumsDay
  const vfrNight = info.vfrMinimumsNight
  const isVFRPermitted = vfrDay.flightVisibilityMi !== null

  return (
    <div
      className="rounded-lg border-2 p-4 dark:bg-slate-900"
      style={{ borderColor: info.color }}
      aria-label={`Details for ${info.name}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <span
          className="text-5xl font-black leading-none"
          style={{ color: info.color }}
          aria-label={`Class ${info.cls}`}
        >
          {info.cls}
        </span>
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{info.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{info.altitudeSummary}</p>
        </div>
      </div>

      {/* Requirements grid */}
      <dl className="mb-3 grid grid-cols-1 gap-1 text-sm">
        <div className="flex items-center gap-2">
          <CheckIcon yes={info.radioRequired} />
          <dt className="text-slate-700 dark:text-slate-300">Radio required</dt>
          <dd className="sr-only">{info.radioRequired ? 'Yes' : 'No'}</dd>
        </div>
        <div className="flex items-center gap-2">
          <CheckIcon yes={info.atcClearanceRequired} />
          <dt className="text-slate-700 dark:text-slate-300">ATC clearance required</dt>
          <dd className="sr-only">{info.atcClearanceRequired ? 'Yes' : 'No'}</dd>
        </div>
        <div className="flex items-center gap-2">
          <CheckIcon yes={info.transponderRequired} />
          <dt className="text-slate-700 dark:text-slate-300">Transponder required</dt>
          <dd className="sr-only">{info.transponderRequired ? 'Yes' : 'No'}</dd>
        </div>
      </dl>

      {/* VFR minimums */}
      <div className="mb-3 rounded-md bg-slate-50 p-3 dark:bg-slate-800">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          VFR Weather Minimums
        </p>
        {!isVFRPermitted ? (
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            VFR flight not permitted
          </p>
        ) : (
          <>
            <div className="mb-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Day</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Visibility: <strong>{vfrDay.flightVisibilityMi} statute mile{vfrDay.flightVisibilityMi !== 1 ? 's' : ''}</strong>
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Clouds: <strong>{vfrDay.cloudClearanceDesc}</strong>
              </p>
              {vfrDay.note && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 italic">{vfrDay.note}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Night</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Visibility: <strong>{vfrNight.flightVisibilityMi} statute mile{vfrNight.flightVisibilityMi !== 1 ? 's' : ''}</strong>
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Clouds: <strong>{vfrNight.cloudClearanceDesc}</strong>
              </p>
              {vfrNight.note && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 italic">{vfrNight.note}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Operating rules */}
      <div className="rounded-md bg-amber-50 p-2.5 dark:bg-amber-950/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">
          Key Rule
        </p>
        <p className="text-sm text-amber-900 dark:text-amber-200">{info.operatingRulesNote}</p>
      </div>
    </div>
  )
}

// ── Drill tab ───────────────────────────────────────────────────────────────

type DrillAnswer = { chosen: string; correct: boolean } | null

interface DrillState {
  index: number
  answers: DrillAnswer[]
}

function DrillTab() {
  const [state, setState] = useState<DrillState>({
    index: 0,
    answers: Array.from<DrillAnswer>({ length: QUIZ_ITEMS.length }).fill(null),
  })

  const isComplete = state.answers.every((a) => a !== null)
  const score = state.answers.filter((a) => a?.correct).length
  const item = QUIZ_ITEMS[state.index]
  const currentAnswer = state.answers[state.index]

  function choose(choice: string) {
    if (!item) return
    if (currentAnswer !== null) return
    const correct = choice === item.answer
    setState((prev) => {
      const answers = [...prev.answers]
      answers[prev.index] = { chosen: choice, correct }
      return { ...prev, answers }
    })
  }

  function next() {
    setState((prev) => ({ ...prev, index: prev.index + 1 }))
  }

  function restart() {
    setState({
      index: 0,
      answers: Array.from<DrillAnswer>({ length: QUIZ_ITEMS.length }).fill(null),
    })
  }

  if (isComplete) {
    const perfect = score === QUIZ_ITEMS.length
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-4xl font-black mb-2" aria-live="polite">
          {score}/{QUIZ_ITEMS.length}
        </p>
        <p className={`text-lg font-semibold mb-4 ${perfect ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {perfect ? 'Perfect score!' : score >= 4 ? 'Great work!' : score >= 3 ? 'Good effort!' : 'Keep studying!'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          You answered {score} of {QUIZ_ITEMS.length} questions correctly.
        </p>
        <button
          type="button"
          onClick={restart}
          className="rounded-md bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Restart Drill
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Progress */}
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Question {state.index + 1} of {QUIZ_ITEMS.length}</span>
        <span>Score: {score}/{state.index}</span>
      </div>
      <div className="mb-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-1.5 rounded-full bg-sky-500 transition-all"
          style={{ width: `${(state.index / QUIZ_ITEMS.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={state.index}
          aria-valuemin={0}
          aria-valuemax={QUIZ_ITEMS.length}
          aria-label={`Progress: question ${state.index + 1} of ${QUIZ_ITEMS.length}`}
        />
      </div>

      {/* Prompt */}
      <p
        id="drill-prompt"
        className="mb-4 font-semibold text-slate-900 dark:text-slate-100 text-base"
      >
        {item.prompt}
      </p>

      {/* Choices */}
      <ul className="space-y-2" role="group" aria-labelledby="drill-prompt">
        {item.choices.map((choice) => {
          const isChosen = currentAnswer?.chosen === choice
          const isCorrect = choice === item.answer
          let cls =
            'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 '

          if (currentAnswer === null) {
            cls +=
              'border-slate-200 hover:border-sky-500 hover:bg-sky-50 dark:border-slate-700 dark:hover:border-sky-700 dark:hover:bg-sky-950/30'
          } else if (isCorrect) {
            cls +=
              'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300'
          } else if (isChosen) {
            cls +=
              'border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
          } else {
            cls += 'border-slate-200 opacity-50 dark:border-slate-700'
          }

          return (
            <li key={choice}>
              <button
                type="button"
                className={cls}
                onClick={() => choose(choice)}
                disabled={currentAnswer !== null}
                aria-pressed={isChosen}
                aria-describedby={currentAnswer !== null ? 'drill-explanation' : undefined}
              >
                {choice}
                {currentAnswer !== null && isCorrect && (
                  <span aria-hidden="true" className="ml-2">✓</span>
                )}
                {currentAnswer !== null && isChosen && !isCorrect && (
                  <span aria-hidden="true" className="ml-2">✗</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Explanation */}
      {currentAnswer !== null && (
        <div id="drill-explanation" className="mt-4" aria-live="polite">
          <p
            className={`mb-1 text-sm font-semibold ${
              currentAnswer.correct
                ? 'text-green-700 dark:text-green-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {currentAnswer.correct ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{item.explanation}</p>
          {state.index < QUIZ_ITEMS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              Next Question
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              See Results
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

type Tab = 'reference' | 'drill'

export function AirspaceTrainer() {
  const [tab, setTab] = useState<Tab>('reference')
  const [selectedClass, setSelectedClass] = useState<AirspaceClass>('B')

  return (
    <figure
      aria-label="Airspace Trainer — interactive National Airspace System reference and drill"
      className="my-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"
    >
      {/* Tab bar */}
      <div
        className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
        role="tablist"
        aria-label="Airspace Trainer tabs"
      >
        {(['reference', 'drill'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`tab-panel-${t}`}
            id={`tab-${t}`}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              tab === t
                ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t === 'reference' ? 'Reference' : 'Drill'}
          </button>
        ))}
      </div>

      {/* Reference tab */}
      <div
        id="tab-panel-reference"
        role="tabpanel"
        aria-labelledby="tab-reference"
        hidden={tab !== 'reference'}
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left: diagram + class buttons */}
          <div className="min-w-0 flex-1">
            <AirspaceDiagram selected={selectedClass} onSelect={setSelectedClass} />
            <ClassButtons selected={selectedClass} onSelect={setSelectedClass} />
          </div>

          {/* Right: detail panel */}
          <div className="min-w-0 lg:w-72 xl:w-80">
            <DetailPanel selected={selectedClass} />
          </div>
        </div>
      </div>

      {/* Drill tab */}
      <div
        id="tab-panel-drill"
        role="tabpanel"
        aria-labelledby="tab-drill"
        hidden={tab !== 'drill'}
      >
        <DrillTab />
      </div>
    </figure>
  )
}
