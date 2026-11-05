import { Link } from 'react-router-dom'

const MODULES = [
  {
    id: 'intro',
    title: 'Introduction',
    description: 'How this site works and how to get the most from it.',
    lessonId: 'intro',
    phase: 0,
  },
  {
    id: 'weight-balance',
    title: 'Weight and Balance',
    description: 'Load a C172S interactively and watch the CG plot on the envelope. 10 questions.',
    lessonId: 'weight-balance',
    phase: 1,
  },
  {
    id: 'aerodynamics',
    title: 'Aerodynamics Explorer',
    description: 'Adjust AoA, airspeed, and bank angle — see lift, drag, load factor, and stall speed update live. 10 questions.',
    lessonId: 'aerodynamics',
    phase: 1,
  },
  {
    id: 'airspace',
    title: 'National Airspace System',
    description: 'Explore classes A–G with an interactive cross-section and built-in drill mode. 10 questions.',
    lessonId: 'airspace',
    phase: 1,
  },
  {
    id: 'signs-markings',
    title: 'Airport Signs & Markings',
    description: 'Learn all 6 sign types (mandatory, location, direction, destination, information, distance remaining) with an interactive drill.',
    lessonId: 'signs-markings',
    phase: 2,
  },
  {
    id: 'taxi',
    title: 'Airport Surface Operations',
    description: 'Trace taxi routes on a fictional airport diagram given ATC clearances. Flags unauthorized runway crossings and missed hold-short instructions.',
    lessonId: 'taxi',
    phase: 2,
  },
  {
    id: 'atc-basics',
    title: 'ATC Communications Basics',
    description: 'Phonetic alphabet drill, aviation number pronunciation, the four-part call structure, and what to read back. 10 questions.',
    lessonId: 'atc-basics',
    phase: 3,
  },
  {
    id: 'atc-scenario',
    title: 'ATC Scenario — VFR Departure',
    description: 'Fly a full scripted departure at Runway City Airport. ATIS → Ground → Tower → Departure. TTS voices the ATC side; typed readbacks are graded item by item.',
    lessonId: 'atc-scenario',
    phase: 3,
  },
] as const

export function Modules() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Modules
      </h1>
      <ul className="space-y-3">
        {MODULES.map((m) => (
          <li key={m.id}>
            <Link
              to={`/lessons/${m.lessonId}`}
              className="block rounded-lg border border-slate-200 p-4 hover:border-sky-500 hover:bg-sky-50 dark:border-slate-700 dark:hover:border-sky-700 dark:hover:bg-sky-950/30"
            >
              <span className="font-medium text-slate-900 dark:text-slate-100">{m.title}</span>
              <span className="ml-2 text-xs text-slate-400">Phase {m.phase}</span>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{m.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
