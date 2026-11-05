import { useState } from 'react'

type SignKind =
  | 'mandatory'
  | 'location'
  | 'direction'
  | 'destination'
  | 'information'
  | 'distanceRemaining'

interface SignExample {
  kind: SignKind
  text: string
}

const SIGN_TYPES: Array<{
  kind: SignKind
  name: string
  colorRule: string
  meaning: string
}> = [
  {
    kind: 'mandatory',
    name: 'Mandatory',
    colorRule: 'Red background, white text and border',
    meaning:
      'Requires a specific pilot action — hold short, no entry, or runway designation. Never cross without ATC clearance.',
  },
  {
    kind: 'location',
    name: 'Location',
    colorRule: 'Black background, yellow text and border',
    meaning:
      'Tells you where you ARE — your current taxiway or runway designation.',
  },
  {
    kind: 'direction',
    name: 'Direction',
    colorRule: 'Yellow background, black text and border',
    meaning:
      'Tells you where to GO — intersection directions with arrows to runways or taxiways.',
  },
  {
    kind: 'destination',
    name: 'Destination',
    colorRule: 'Yellow background, black text and border',
    meaning:
      'Points toward a destination on the airport (FBO, terminal, runup area).',
  },
  {
    kind: 'information',
    name: 'Information',
    colorRule: 'Yellow background, black text',
    meaning:
      'Provides operational information such as noise abatement procedures or frequency changes.',
  },
  {
    kind: 'distanceRemaining',
    name: 'Distance Remaining',
    colorRule: 'Black background, white text and border',
    meaning:
      'Found along runways, counting down remaining takeoff/landing distance in thousands of feet.',
  },
]

function SignDisplay({ kind, text }: SignExample) {
  const base = 'inline-block rounded px-3 py-1 font-mono text-lg font-bold border-2'
  const styles: Record<SignKind, string> = {
    mandatory: `${base} bg-red-600 text-white border-white`,
    location: `${base} bg-black text-yellow-300 border-yellow-300`,
    direction: `${base} bg-yellow-300 text-black border-black`,
    destination: `${base} bg-yellow-300 text-black border-black font-normal`,
    information: 'inline-block rounded px-3 py-1 font-mono text-sm bg-yellow-300 text-black border-2 border-black',
    distanceRemaining: `${base} bg-black text-white border-white text-xl`,
  }
  return <span className={styles[kind]}>{text}</span>
}

const DRILL_QUESTIONS: Array<{
  sign: SignExample
  answer: string
  choices: string[]
  wrongExplanation: string
}> = [
  {
    sign: { kind: 'mandatory', text: '18' },
    answer: 'Mandatory (runway designation)',
    choices: ['Mandatory (runway designation)', 'Location (taxiway/runway)', 'Direction', 'Distance Remaining'],
    wrongExplanation: 'Red signs are always mandatory — they require a specific action like holding short of runway 18.',
  },
  {
    sign: { kind: 'location', text: 'A' },
    answer: 'Location (taxiway/runway)',
    choices: ['Direction', 'Location (taxiway/runway)', 'Destination', 'Mandatory (runway designation)'],
    wrongExplanation: 'Black signs with yellow text are location signs — they tell you where you ARE on the airport.',
  },
  {
    sign: { kind: 'mandatory', text: '36' },
    answer: 'Mandatory (runway designation)',
    choices: ['Information', 'Distance Remaining', 'Mandatory (runway designation)', 'Location (taxiway/runway)'],
    wrongExplanation: 'Red signs are always mandatory. This sign designates Runway 36 — stop and hold short.',
  },
  {
    sign: { kind: 'distanceRemaining', text: '2' },
    answer: 'Distance Remaining',
    choices: ['Mandatory (runway designation)', 'Location (taxiway/runway)', 'Distance Remaining', 'Information'],
    wrongExplanation: 'Black signs with white text along a runway are distance remaining markers, counting down in thousands of feet.',
  },
  {
    sign: { kind: 'direction', text: 'B →' },
    answer: 'Direction',
    choices: ['Destination', 'Direction', 'Location (taxiway/runway)', 'Mandatory (runway designation)'],
    wrongExplanation: 'Yellow background with black text and an arrow means direction — it tells you where to GO.',
  },
  {
    sign: { kind: 'destination', text: 'RAMP →' },
    answer: 'Destination',
    choices: ['Direction', 'Information', 'Destination', 'Location (taxiway/runway)'],
    wrongExplanation: 'Yellow signs pointing to named destinations (ramp, FBO, terminal) are destination signs.',
  },
  {
    sign: { kind: 'mandatory', text: '9-27' },
    answer: 'Mandatory (runway designation)',
    choices: ['Location (taxiway/runway)', 'Mandatory (runway designation)', 'Direction', 'Information'],
    wrongExplanation: 'Red background always means mandatory. This is the hold-short sign for Runway 9-27.',
  },
  {
    sign: { kind: 'location', text: 'C' },
    answer: 'Location (taxiway/runway)',
    choices: ['Direction', 'Destination', 'Mandatory (runway designation)', 'Location (taxiway/runway)'],
    wrongExplanation: 'Black background with yellow text — you are on Taxiway C. Location signs tell you where you ARE.',
  },
  {
    sign: { kind: 'information', text: 'NOISE ABATEMENT' },
    answer: 'Information',
    choices: ['Mandatory (runway designation)', 'Destination', 'Information', 'Direction'],
    wrongExplanation: 'Yellow signs without arrows that convey operational guidance are information signs.',
  },
  {
    sign: { kind: 'distanceRemaining', text: '1' },
    answer: 'Distance Remaining',
    choices: ['Distance Remaining', 'Mandatory (runway designation)', 'Location (taxiway/runway)', 'Information'],
    wrongExplanation: 'The last distance-remaining marker — 1,000 ft of runway remains. Black background, white text.',
  },
]

export function SignsTrainer() {
  const [tab, setTab] = useState<'reference' | 'drill'>('reference')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  function handleChoice(choice: string) {
    if (selected !== null) return
    setSelected(choice)
    if (choice === DRILL_QUESTIONS[current].answer) {
      setScore((s) => s + 1)
    }
  }

  function handleNext() {
    if (current + 1 >= DRILL_QUESTIONS.length) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  function handleRestart() {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  const q = DRILL_QUESTIONS[current]

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['reference', 'drill'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white border-b-2 border-blue-600 text-blue-700'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'reference' ? 'Reference' : 'Drill'}
          </button>
        ))}
      </div>

      {/* Reference tab */}
      {tab === 'reference' && (
        <div className="p-4 space-y-4">
          {SIGN_TYPES.map((st) => (
            <div key={st.kind} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
              <div className="pt-1">
                <SignDisplay kind={st.kind} text={
                  st.kind === 'mandatory' ? '18-36'
                  : st.kind === 'location' ? 'A'
                  : st.kind === 'direction' ? 'B →'
                  : st.kind === 'destination' ? 'FBO →'
                  : st.kind === 'information' ? 'NOISE ABATEMENT'
                  : '3'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{st.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{st.colorRule}</p>
                <p className="text-sm text-gray-700 mt-1">{st.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drill tab */}
      {tab === 'drill' && (
        <div className="p-4">
          {done ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-2xl font-bold text-gray-900">
                {score} / {DRILL_QUESTIONS.length}
              </p>
              <p className="text-gray-600">
                {score === DRILL_QUESTIONS.length
                  ? 'Perfect score!'
                  : score >= 7
                  ? 'Great work — almost there.'
                  : 'Keep practicing — signs save lives.'}
              </p>
              <button
                onClick={handleRestart}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Restart
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Question {current + 1} of {DRILL_QUESTIONS.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">What type of sign is this?</p>
                <SignDisplay kind={q.sign.kind} text={q.sign.text} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.choices.map((choice) => {
                  const isCorrect = choice === q.answer
                  const isSelected = choice === selected
                  let cls = 'rounded-lg border px-3 py-2 text-sm text-left transition-colors '
                  if (selected === null) {
                    cls += 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  } else if (isCorrect) {
                    cls += 'border-green-500 bg-green-50 text-green-800 font-medium'
                  } else if (isSelected) {
                    cls += 'border-red-400 bg-red-50 text-red-800'
                  } else {
                    cls += 'border-gray-100 text-gray-400'
                  }
                  return (
                    <button key={choice} className={cls} onClick={() => handleChoice(choice)}>
                      {choice}
                    </button>
                  )
                })}
              </div>
              {selected !== null && (
                <div className="space-y-2">
                  {selected !== q.answer && (
                    <p className="text-xs text-red-700 bg-red-50 rounded p-2">
                      {q.wrongExplanation}
                    </p>
                  )}
                  <button
                    onClick={handleNext}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {current + 1 >= DRILL_QUESTIONS.length ? 'See Results' : 'Next'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
