import { useState, useMemo } from 'react'
import { AirportSchema } from '../../engines/schemas'
import type { Airport, AirportNode } from '../../engines/schemas'
import { neighbors, unauthorizedCrossings } from '../../engines/airport'
import rawAirport from '../../../data/airports/teach1.json'

// ── Scenario model ──────────────────────────────────────────────────────────

interface TaxiScenario {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  atcClearance: string
  startNodeId: string
  goalNodeId: string
  authorizedRunwayIds: string[]
  holdShortNodeId?: string
  successFeedback: string
}

const SCENARIOS: readonly TaxiScenario[] = [
  {
    id: 'sc1',
    title: 'Simple taxi to Runway 18',
    difficulty: 'easy',
    atcClearance:
      '"November One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway One Eight via Alpha." [Start: parking ramp]',
    startNodeId: 'parking',
    goalNodeId: 'twa_hs_18',
    authorizedRunwayIds: [],
    successFeedback:
      'Correct! Taxiway Alpha runs directly to the Runway 18 hold-short line. No runway crossings needed from the north ramp.',
  },
  {
    id: 'sc2',
    title: 'FBO to Runway 36',
    difficulty: 'easy',
    atcClearance:
      '"November One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway Three Six via Charlie, Alpha." [Start: FBO]',
    startNodeId: 'fbo',
    goalNodeId: 'twa_hs_36',
    authorizedRunwayIds: [],
    successFeedback:
      'Correct! From the FBO via Charlie to Alpha south — no active runway crossings. Notice how Taxiway C connects the FBO area to Alpha.',
  },
  {
    id: 'sc3',
    title: 'FBO to Runway 18 — crossing required',
    difficulty: 'medium',
    atcClearance:
      '"November One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway One Eight via Charlie, Alpha, cross Runway Zero-Niner Two-Seven." [Start: FBO]',
    startNodeId: 'fbo',
    goalNodeId: 'twa_hs_18',
    authorizedRunwayIds: ['09/27'],
    successFeedback:
      'Correct! You crossed Runway 09/27 as authorized. Always verify the runway crossing is explicit in the clearance before proceeding — never assume.',
  },
  {
    id: 'sc4',
    title: 'Hold short of Runway 09/27',
    difficulty: 'medium',
    atcClearance:
      '"November One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway One Eight via Alpha, hold short of Runway Zero-Niner Two-Seven." [Start: parking ramp]',
    startNodeId: 'parking',
    goalNodeId: 'twa_09_27_hs',
    holdShortNodeId: 'twa_09_27_hs',
    authorizedRunwayIds: [],
    successFeedback:
      'Correct! You stopped at the hold-short line for Runway 09/27. The yellow bars on the pavement (and the red "9-27" sign) mean you need an explicit crossing clearance before proceeding.',
  },
  {
    id: 'sc5',
    title: 'Parking to Runway 36 — crossing required',
    difficulty: 'hard',
    atcClearance:
      '"November One Two Three Foxtrot Sierra, Runway City Ground, taxi to Runway Three Six via Alpha, cross Runway Zero-Niner Two-Seven." [Start: parking ramp]',
    startNodeId: 'parking',
    goalNodeId: 'twa_hs_36',
    authorizedRunwayIds: ['09/27'],
    successFeedback:
      'Correct! Southbound from parking, crossing Runway 09/27 as authorized, then continuing to the Runway 36 hold-short line.',
  },
]

// ── Validation ──────────────────────────────────────────────────────────────

interface ValidationResult {
  passed: boolean
  errorType?: 'wrongDestination' | 'unauthorizedCrossing' | 'crossedHoldShort'
  message: string
}

function validateRoute(
  airport: Airport,
  path: string[],
  scenario: TaxiScenario,
): ValidationResult {
  // 1. Unauthorized runway crossing
  const badCrossings = unauthorizedCrossings(airport, path, scenario.authorizedRunwayIds)
  if (badCrossings.length > 0) {
    return {
      passed: false,
      errorType: 'unauthorizedCrossing',
      message: `You crossed Runway ${badCrossings[0]} without authorization. Always wait for an explicit crossing clearance.`,
    }
  }

  // 2. Crossed hold-short line
  if (scenario.holdShortNodeId != null) {
    const hsIndex = path.indexOf(scenario.holdShortNodeId)
    if (hsIndex !== -1 && path.includes('twa_09_27_cross')) {
      return {
        passed: false,
        errorType: 'crossedHoldShort',
        message:
          'You crossed the hold-short line without authorization. Stop at the yellow bars and await explicit crossing clearance.',
      }
    }
  }

  // 3. Wrong destination
  const lastNode = path[path.length - 1]
  if (lastNode !== scenario.goalNodeId) {
    const goalNode = airport.nodes.find((n) => n.id === scenario.goalNodeId)
    const label = goalNode ? goalNode.id : scenario.goalNodeId
    return {
      passed: false,
      errorType: 'wrongDestination',
      message: `You ended at the wrong position. The clearance called for ${label}.`,
    }
  }

  // 4. Success
  return { passed: true, message: scenario.successFeedback }
}

// ── SVG Airport Diagram ─────────────────────────────────────────────────────

function nodeRadius(kind: AirportNode['kind']): number {
  if (kind === 'intersection') return 6
  if (kind === 'holdShort') return 7
  if (kind === 'runwayEntry') return 4
  return 5 // parking / fbo / runup
}

interface DiagramProps {
  airport: Airport
  userPath: string[]
  goalNodeId: string
  onNodeClick: (nodeId: string) => void
}

function AirportDiagram({ airport, userPath, goalNodeId, onNodeClick }: DiagramProps) {
  const pathSet = new Set(userPath)
  const currentNodeId = userPath[userPath.length - 1]

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <svg
        viewBox="0 0 1000 800"
        width="100%"
        aria-label="Airport taxi diagram — tap nodes to trace your route"
        role="img"
      >
        {/* Background */}
        <rect x={0} y={0} width={1000} height={800} fill="#f8fafc" />

        {/* ── Runways ── */}
        {/* Runway 18/36 (vertical) */}
        <rect x={488} y={80} width={24} height={640} fill="#374151" />
        {/* Runway 18/36 centerline dashes */}
        <line x1={500} y1={80} x2={500} y2={720} stroke="white" strokeWidth={1.5} strokeDasharray="20 10" />
        {/* Runway 09/27 (horizontal) */}
        <rect x={80} y={390} width={840} height={20} fill="#374151" />
        {/* Runway 09/27 centerline dashes */}
        <line x1={80} y1={400} x2={920} y2={400} stroke="white" strokeWidth={1.5} strokeDasharray="20 10" />

        {/* Runway end labels */}
        <text x={500} y={95} fontSize={11} fontWeight="bold" fill="white" textAnchor="middle">18</text>
        <text x={500} y={712} fontSize={11} fontWeight="bold" fill="white" textAnchor="middle">36</text>
        <text x={100} y={404} fontSize={11} fontWeight="bold" fill="white" textAnchor="middle">09</text>
        <text x={900} y={404} fontSize={11} fontWeight="bold" fill="white" textAnchor="middle">27</text>

        {/* ── Taxiways ── */}
        {/* Taxiway A (vertical strip) */}
        <rect x={644} y={130} width={12} height={538} fill="#78716c" />
        {/* Taxiway B (short horizontal stub) */}
        <rect x={500} y={394} width={150} height={12} fill="#78716c" />
        {/* Taxiway C (horizontal) */}
        <rect x={400} y={554} width={420} height={12} fill="#78716c" />

        {/* Taxiway labels */}
        <text x={664} y={240} fontSize={12} fontWeight="bold" fill="#ca8a04" textAnchor="middle">A</text>
        <text x={580} y={390} fontSize={12} fontWeight="bold" fill="#ca8a04" textAnchor="middle">B</text>
        <text x={450} y={548} fontSize={12} fontWeight="bold" fill="#ca8a04" textAnchor="middle">C</text>

        {/* ── Hold-short markings ── */}
        {/* twa_hs_18: Taxiway A hold-short at Runway 18/36 (top) */}
        <line x1={638} y1={130} x2={662} y2={130} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={638} y1={134} x2={662} y2={134} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={638} y1={138} x2={662} y2={138} stroke="#eab308" strokeWidth={1.5} />
        <line x1={638} y1={141} x2={662} y2={141} stroke="#eab308" strokeWidth={1.5} />

        {/* twa_09_27_hs: Taxiway A hold-short at Runway 09/27 */}
        <line x1={638} y1={350} x2={662} y2={350} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={638} y1={354} x2={662} y2={354} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={638} y1={358} x2={662} y2={358} stroke="#eab308" strokeWidth={1.5} />
        <line x1={638} y1={361} x2={662} y2={361} stroke="#eab308" strokeWidth={1.5} />

        {/* twa_hs_36: Taxiway A hold-short at Runway 18/36 (bottom) */}
        <line x1={638} y1={662} x2={662} y2={662} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={638} y1={666} x2={662} y2={666} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={638} y1={670} x2={662} y2={670} stroke="#eab308" strokeWidth={1.5} />
        <line x1={638} y1={673} x2={662} y2={673} stroke="#eab308" strokeWidth={1.5} />

        {/* twb_hs_1836: Taxiway B hold-short at Runway 18/36 */}
        <line x1={548} y1={394} x2={548} y2={406} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={552} y1={394} x2={552} y2={406} stroke="#eab308" strokeWidth={3} strokeDasharray="4 2" />
        <line x1={556} y1={394} x2={556} y2={406} stroke="#eab308" strokeWidth={1.5} />
        <line x1={559} y1={394} x2={559} y2={406} stroke="#eab308" strokeWidth={1.5} />

        {/* ── Operational areas ── */}
        {/* FBO */}
        <rect x={810} y={460} width={60} height={50} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} rx={3} />
        <text x={840} y={490} fontSize={11} fontWeight="bold" fill="#3b82f6" textAnchor="middle">FBO</text>

        {/* Parking */}
        <rect x={730} y={270} width={60} height={50} fill="#1e3a5f" stroke="#6b7280" strokeWidth={1.5} rx={3} />
        <text x={760} y={294} fontSize={10} fontWeight="bold" fill="#9ca3af" textAnchor="middle">Park-</text>
        <text x={760} y={307} fontSize={10} fontWeight="bold" fill="#9ca3af" textAnchor="middle">ing</text>

        {/* Run-up areas */}
        <rect x={695} y={140} width={50} height={40} fill="#1a3300" stroke="#16a34a" strokeWidth={1.5} rx={3} />
        <text x={720} y={163} fontSize={10} fontWeight="bold" fill="#4ade80" textAnchor="middle">Run-up</text>

        <rect x={695} y={660} width={50} height={40} fill="#1a3300" stroke="#16a34a" strokeWidth={1.5} rx={3} />
        <text x={720} y={683} fontSize={10} fontWeight="bold" fill="#4ade80" textAnchor="middle">Run-up</text>

        {/* ── Hotspot HS1 indicator ── */}
        {/* Orange diamond near twa_09_27_cross (650, 400) */}
        <polygon
          points="635,400 650,390 665,400 650,410"
          fill="#f97316"
          opacity={0.85}
        />
        <text x={650} y={381} fontSize={9} fontWeight="bold" fill="#f97316" textAnchor="middle">HS1</text>

        {/* ── User path edges ── */}
        {userPath.length > 1 &&
          userPath.slice(0, -1).map((nodeId, i) => {
            const a = airport.nodes.find((n) => n.id === nodeId)
            const b = airport.nodes.find((n) => n.id === userPath[i + 1])
            if (!a || !b) return null
            return (
              <line
                key={`path-${i}`}
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke="#2563eb"
                strokeWidth={4}
                opacity={0.7}
                strokeLinecap="round"
              />
            )
          })}

        {/* ── Nodes ── */}
        {airport.nodes.map((node) => {
          const r = nodeRadius(node.kind)
          const inPath = pathSet.has(node.id)
          const isCurrent = node.id === currentNodeId
          const isGoal = node.id === goalNodeId

          let fill = '#475569'
          if (node.kind === 'holdShort') fill = '#eab308'
          else if (node.kind === 'runwayEntry') fill = '#374151'
          else if (node.kind === 'parking' || node.kind === 'fbo' || node.kind === 'runup') fill = '#1e40af'

          if (isCurrent) fill = '#2563eb'

          return (
            <g key={node.id}>
              {/* Goal pulse ring */}
              {isGoal && !isCurrent && (
                <circle
                  cx={node.x} cy={node.y}
                  r={r + 10}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth={2}
                  opacity={0.7}
                  className="animate-pulse"
                />
              )}
              {/* In-path selection ring */}
              {inPath && !isCurrent && (
                <circle
                  cx={node.x} cy={node.y}
                  r={r + 6}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                />
              )}
              {/* Main node circle */}
              <circle
                cx={node.x} cy={node.y}
                r={isCurrent ? 10 : r}
                fill={fill}
                stroke={node.kind === 'holdShort' ? '#b45309' : 'none'}
                strokeWidth={node.kind === 'holdShort' ? 1.5 : 0}
              />
              {/* Aircraft emoji for current position */}
              {isCurrent && (
                <text
                  x={node.x} y={node.y}
                  fontSize={14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ userSelect: 'none' }}
                  aria-label="Aircraft current position"
                >
                  ✈
                </text>
              )}
              {/* Transparent click target */}
              <circle
                cx={node.x} cy={node.y}
                r={20}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`Node ${node.id}`}
                tabIndex={0}
                onClick={() => onNodeClick(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onNodeClick(node.id)
                }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Difficulty badge ─────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: TaxiScenario['difficulty'] }) {
  const cls =
    difficulty === 'easy'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      : difficulty === 'medium'
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {difficulty}
    </span>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

type Phase = 'tracing' | 'result'

export function TaxiTracer() {
  const airport = useMemo<Airport>(() => AirportSchema.parse(rawAirport), [])

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [userPath, setUserPath] = useState<string[]>([SCENARIOS[0].startNodeId])
  const [phase, setPhase] = useState<Phase>('tracing')
  const [result, setResult] = useState<ValidationResult | null>(null)

  const scenario = SCENARIOS[scenarioIndex]

  function selectScenario(index: number) {
    setScenarioIndex(index)
    setUserPath([SCENARIOS[index].startNodeId])
    setPhase('tracing')
    setResult(null)
  }

  function handleNodeClick(nodeId: string) {
    if (phase !== 'tracing') return
    if (userPath.length === 0) return

    const lastNode = userPath[userPath.length - 1]
    // Allow re-clicking the start node to deselect isn't needed; just ignore
    if (nodeId === lastNode) return

    const adj = neighbors(airport, lastNode)
    if (!adj.includes(nodeId)) return

    setUserPath((prev) => [...prev, nodeId])
  }

  function handleBack() {
    if (userPath.length <= 1) return
    setUserPath((prev) => prev.slice(0, -1))
  }

  function handleCheckRoute() {
    const res = validateRoute(airport, userPath, scenario)
    setResult(res)
    setPhase('result')
  }

  function handleTryAgain() {
    setUserPath([scenario.startNodeId])
    setPhase('tracing')
    setResult(null)
  }

  function handleNext() {
    const nextIndex = (scenarioIndex + 1) % SCENARIOS.length
    selectScenario(nextIndex)
  }

  return (
    <figure
      aria-label="Taxi Route Tracer — interactive taxi clearance trainer"
      className="my-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"
    >
      <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">
        Taxi Route Tracer
      </h3>

      {/* Scenario selector */}
      <div
        className="mb-3 flex flex-wrap gap-2"
        role="group"
        aria-label="Select scenario"
      >
        {SCENARIOS.map((sc, i) => (
          <button
            key={sc.id}
            type="button"
            aria-pressed={i === scenarioIndex}
            onClick={() => selectScenario(i)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              i === scenarioIndex
                ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200'
                : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500'
            }`}
          >
            <span>{sc.title}</span>
            <DifficultyBadge difficulty={sc.difficulty} />
          </button>
        ))}
      </div>

      {/* ATC clearance */}
      <div role="status" aria-live="polite" className="mb-3">
        <p className="rounded bg-slate-800 p-3 font-mono text-sm text-green-400 dark:bg-slate-900">
          🎧 ATC: {scenario.atcClearance}
        </p>
      </div>

      {/* Airport diagram */}
      <div className="mb-3">
        <AirportDiagram
          airport={airport}
          userPath={userPath}
          goalNodeId={scenario.goalNodeId}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Controls */}
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={userPath.length <= 1 || phase === 'result'}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back
        </button>
        {phase === 'tracing' && (
          <button
            type="button"
            onClick={handleCheckRoute}
            disabled={userPath.length < 2}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Check Route
          </button>
        )}
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {userPath.length} node{userPath.length !== 1 ? 's' : ''} tapped
        </span>
      </div>

      {/* Result banner */}
      {phase === 'result' && result !== null && (
        <div
          className={`rounded-lg border p-4 ${
            result.passed
              ? 'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/30'
              : 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
          }`}
          aria-live="assertive"
        >
          <p
            className={`mb-1 text-sm font-semibold ${
              result.passed
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
            }`}
          >
            {result.passed ? 'Correct!' : 'Not quite.'}
          </p>
          <p
            className={`mb-3 text-sm ${
              result.passed
                ? 'text-green-700 dark:text-green-200'
                : 'text-red-700 dark:text-red-200'
            }`}
          >
            {result.message}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTryAgain}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              Next Scenario
            </button>
          </div>
        </div>
      )}
    </figure>
  )
}
