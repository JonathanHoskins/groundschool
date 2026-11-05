// Readback grader engine — ATC communications, Phase 3
// Pure TypeScript, no React imports.

export type ReadbackKind =
  | 'callsign'
  | 'runway'
  | 'holdShort'
  | 'taxiRoute'
  | 'altimeter'
  | 'squawk'
  | 'frequency'
  | 'altitude'
  | 'heading'
  | 'clearanceLimit'

export interface ReadbackItem {
  kind: ReadbackKind
  value: string  // normalized: uppercase, e.g. "NOVEMBER ONE TWO THREE FOXTROT SIERRA"
  hint: string   // hint shown if missed
}

export interface GradeResult {
  score: number          // 0.0–1.0
  missing: ReadbackItem[]
  present: ReadbackItem[]
  feedback: string       // Human-readable overall feedback
}

// ── Digit / word maps ────────────────────────────────────────────────────────

const DIGIT_TO_WORD: Record<string, string> = {
  '0': 'ZERO',
  '1': 'ONE',
  '2': 'TWO',
  '3': 'THREE',
  '4': 'FOUR',
  '5': 'FIVE',
  '6': 'SIX',
  '7': 'SEVEN',
  '8': 'EIGHT',
  '9': 'NINE',
}

const WORD_TO_DIGIT: Record<string, string> = {
  ZERO: '0',
  ONE: '1',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  // aviation variants
  NINER: '9',
  WUN: '1',
  TOO: '2',
  TREE: '3',
  FOWER: '4',
  FIFE: '5',
  AIT: '8',
}

// ICAO phonetic alphabet — word → letter
const PHONETIC_TO_LETTER: Record<string, string> = {
  ALPHA: 'A',
  BRAVO: 'B',
  CHARLIE: 'C',
  DELTA: 'D',
  ECHO: 'E',
  FOXTROT: 'F',
  GOLF: 'G',
  HOTEL: 'H',
  INDIA: 'I',
  JULIET: 'J',
  KILO: 'K',
  LIMA: 'L',
  MIKE: 'M',
  NOVEMBER: 'N',
  OSCAR: 'O',
  PAPA: 'P',
  QUEBEC: 'Q',
  ROMEO: 'R',
  SIERRA: 'S',
  TANGO: 'T',
  UNIFORM: 'U',
  VICTOR: 'V',
  WHISKEY: 'W',
  XRAY: 'X',
  YANKEE: 'Y',
  ZULU: 'Z',
}

// ── numberToSpoken ───────────────────────────────────────────────────────────

/**
 * Convert a number string to its aviation spoken word form.
 * Each digit is spoken individually; decimals use "POINT".
 * "18" → "ONE EIGHT", "118.4" → "ONE ONE EIGHT POINT FOUR", "5200" → "FIVE TWO ZERO ZERO"
 */
export function numberToSpoken(n: string): string {
  const parts = n.split('.')
  const intPart = parts[0]
  const decPart = parts[1]

  const spokenDigits = (s: string): string =>
    s
      .split('')
      .map((ch) => DIGIT_TO_WORD[ch] ?? ch)
      .join(' ')

  const result = spokenDigits(intPart)
  if (decPart !== undefined) {
    return result + ' POINT ' + spokenDigits(decPart)
  }
  return result
}

// ── normalizeReadback ────────────────────────────────────────────────────────

/**
 * Normalize text for comparison:
 * 1. Uppercase
 * 2. Expand phonetic alphabet words to letters
 * 3. Expand spoken number words to digits
 * 4. Strip punctuation (keep spaces)
 * 5. Collapse multiple spaces
 */
export function normalizeReadback(text: string): string {
  // 1. Uppercase
  let s = text.toUpperCase()

  // 2. Strip punctuation (keep alphanumeric and spaces)
  s = s.replace(/[^A-Z0-9 ]/g, ' ')

  // 3. Expand phonetic alphabet words to letters
  //    e.g. "NOVEMBER" → "N", "FOXTROT" → "F"
  //    Replace whole words only
  for (const [word, letter] of Object.entries(PHONETIC_TO_LETTER)) {
    const re = new RegExp(`\\b${word}\\b`, 'g')
    s = s.replace(re, letter)
  }

  // 4. Expand spoken number words to digits (aviation variants too)
  for (const [word, digit] of Object.entries(WORD_TO_DIGIT)) {
    const re = new RegExp(`\\b${word}\\b`, 'g')
    s = s.replace(re, digit)
  }

  // 5. Split runs of consecutive digits into space-separated single digits
  //    so "7700" → "7 7 0 0" and matches a pilot saying "seven seven zero zero"
  s = s.replace(/\d+/g, (match) => match.split('').join(' '))

  // 6. Collapse spaces
  s = s.replace(/\s+/g, ' ').trim()

  return s
}

// ── gradeReadback ────────────────────────────────────────────────────────────

/**
 * Grade a pilot's readback text against required items.
 * Uses case-insensitive substring matching after normalization.
 * Numbers can appear as digits or words.
 */
export function gradeReadback(pilotText: string, required: ReadbackItem[]): GradeResult {
  if (required.length === 0) {
    return {
      score: 1.0,
      missing: [],
      present: [],
      feedback: 'Perfect readback.',
    }
  }

  const normalizedPilot = normalizeReadback(pilotText)
  const present: ReadbackItem[] = []
  const missing: ReadbackItem[] = []

  for (const item of required) {
    const normalizedValue = normalizeReadback(item.value)
    // Also create a digit-form version: normalize the spoken value as digits
    // and check if that appears in the pilot text
    const found =
      normalizedPilot.includes(normalizedValue) ||
      checkAlternativeForm(normalizedPilot, normalizedValue)

    if (found) {
      present.push(item)
    } else {
      missing.push(item)
    }
  }

  const score = present.length / required.length

  let feedback: string
  if (score === 1.0) {
    feedback = 'Perfect readback.'
  } else if (score >= 0.5) {
    const missedList = missing.map((item) => item.hint).join('; ')
    feedback = `Good readback, but you missed: ${missedList}`
  } else {
    const allList = required.map((item) => item.hint).join('; ')
    feedback = `Incomplete readback. Required items: ${allList}`
  }

  return { score, missing, present, feedback }
}

/**
 * Check whether the pilot said the item in an alternative form.
 * For example, if the item value is digits like "18", check if the pilot
 * said "ONE EIGHT" (spoken form). And if the item value is spoken like
 * "ONE EIGHT", check if the pilot said "18".
 */
function checkAlternativeForm(normalizedPilot: string, normalizedValue: string): boolean {
  // Try converting normalizedValue (which may contain digits) to spoken form
  // and check if that appears in pilot text.
  const spokenVersion = digitsToWords(normalizedValue)
  if (spokenVersion !== normalizedValue && normalizedPilot.includes(spokenVersion)) {
    return true
  }

  // Try converting normalizedValue (which may contain words) to digit form
  const digitVersion = wordsToDigits(normalizedValue)
  if (digitVersion !== normalizedValue && normalizedPilot.includes(digitVersion)) {
    return true
  }

  return false
}

/** Replace each digit character in a string with its spoken word */
function digitsToWords(s: string): string {
  return s
    .split(' ')
    .map((token) => {
      // If token is all digits, convert digit by digit
      if (/^\d+$/.test(token)) {
        return token
          .split('')
          .map((d) => DIGIT_TO_WORD[d] ?? d)
          .join(' ')
      }
      return token
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Replace spoken number words in a string with digit characters */
function wordsToDigits(s: string): string {
  let result = s
  for (const [word, digit] of Object.entries(WORD_TO_DIGIT)) {
    const re = new RegExp(`\\b${word}\\b`, 'g')
    result = result.replace(re, digit)
  }
  return result.replace(/\s+/g, ' ').trim()
}
