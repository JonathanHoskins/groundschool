import { useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

interface DrillCard {
  front: string
  back: string
}

const ALPHABET_CARDS: DrillCard[] = [
  { front: 'A', back: 'Alpha' },
  { front: 'B', back: 'Bravo' },
  { front: 'C', back: 'Charlie' },
  { front: 'D', back: 'Delta' },
  { front: 'E', back: 'Echo' },
  { front: 'F', back: 'Foxtrot' },
  { front: 'G', back: 'Golf' },
  { front: 'H', back: 'Hotel' },
  { front: 'I', back: 'India' },
  { front: 'J', back: 'Juliet' },
  { front: 'K', back: 'Kilo' },
  { front: 'L', back: 'Lima' },
  { front: 'M', back: 'Mike' },
  { front: 'N', back: 'November' },
  { front: 'O', back: 'Oscar' },
  { front: 'P', back: 'Papa' },
  { front: 'Q', back: 'Quebec' },
  { front: 'R', back: 'Romeo' },
  { front: 'S', back: 'Sierra' },
  { front: 'T', back: 'Tango' },
  { front: 'U', back: 'Uniform' },
  { front: 'V', back: 'Victor' },
  { front: 'W', back: 'Whiskey' },
  { front: 'X', back: 'X-ray' },
  { front: 'Y', back: 'Yankee' },
  { front: 'Z', back: 'Zulu' },
]

const NUMBER_CARDS: DrillCard[] = [
  { front: '0', back: 'ZERO' },
  { front: '1', back: 'WUN' },
  { front: '2', back: 'TOO' },
  { front: '3', back: 'TREE' },
  { front: '4', back: 'FOWER' },
  { front: '5', back: 'FIFE' },
  { front: '6', back: 'SIX' },
  { front: '7', back: 'SEVEN' },
  { front: '8', back: 'AIT' },
  { front: '9', back: 'NINER' },
  { front: '118.4', back: 'ONE ONE EIGHT POINT FOUR' },
  { front: '5500', back: 'FIVE THOUSAND FIVE HUNDRED' },
  { front: '180', back: 'ONE EIGHT ZERO' },
  { front: '5200', back: 'FIVE TWO ZERO ZERO' },
]

type Mode = 'alphabet' | 'numbers'

export function PhoneticDrill() {
  const [mode, setMode] = useState<Mode>('alphabet')
  const allCards = mode === 'alphabet' ? ALPHABET_CARDS : NUMBER_CARDS
  const [queue, setQueue] = useState<number[]>(() => allCards.map((_, i) => i))
  const [mastered, setMastered] = useState<number>(0)
  const [flipped, setFlipped] = useState<boolean>(false)
  const [done, setDone] = useState<boolean>(false)
  const currentCard = queue[0] !== undefined ? allCards[queue[0]] : null

  function reset(next: Mode = mode) {
    const cards = next === 'alphabet' ? ALPHABET_CARDS : NUMBER_CARDS
    setMode(next)
    setQueue(cards.map((_, i) => i))
    setMastered(0)
    setFlipped(false)
    setDone(false)
  }

  function handleCorrect() {
    const remaining = queue.slice(1)
    setMastered((m) => m + 1)
    setFlipped(false)
    if (remaining.length === 0) setDone(true)
    else setQueue(remaining)
  }

  function handlePractice() {
    setFlipped(false)
    setQueue([...queue.slice(1), queue[0]])
  }

  const total = allCards.length

  return (
    <div className="my-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      {/* Tab bar */}
      <div className="mb-6 flex gap-2">
        {(['alphabet', 'numbers'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => reset(m)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-sky-600 text-white'
                : 'border border-slate-200 text-slate-600 hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:text-slate-400'
            }`}
          >
            {m === 'alphabet' ? 'Alphabet' : 'Numbers'}
          </button>
        ))}
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">Complete!</p>
          <p className="text-slate-600 dark:text-slate-400">
            You mastered all {total} cards.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Restart
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Mastered: {mastered} / {total}
          </p>

          {/* Flashcard */}
          {currentCard && (
            <div
              className="relative mx-auto h-40 w-72 cursor-pointer"
              style={{ perspective: '800px' }}
              onClick={() => setFlipped((f) => !f)}
            >
              <div
                className="absolute inset-0 transition-transform duration-300"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-5xl font-bold text-sky-700 dark:text-sky-300">
                    {currentCard.front}
                  </span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/40"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="px-4 text-center text-2xl font-semibold text-green-700 dark:text-green-300">
                    {currentCard.back}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-slate-400">
            {flipped ? 'How did you do?' : 'Click to reveal'}
          </p>

          {/* Action buttons — only shown after flip */}
          {flipped && (
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleCorrect}
                className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={handlePractice}
                className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:text-slate-300"
              >
                Need more practice
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
