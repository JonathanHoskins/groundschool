import { describe, expect, it } from 'vitest'
import { gradeReadback, numberToSpoken, normalizeReadback } from '../../src/engines/readback'
import type { ReadbackItem } from '../../src/engines/readback'

// ── numberToSpoken ────────────────────────────────────────────────────────────

describe('numberToSpoken', () => {
  it('converts 18 to ONE EIGHT', () => {
    expect(numberToSpoken('18')).toBe('ONE EIGHT')
  })

  it('converts 36 to THREE SIX', () => {
    expect(numberToSpoken('36')).toBe('THREE SIX')
  })

  it('converts 5200 to FIVE TWO ZERO ZERO', () => {
    expect(numberToSpoken('5200')).toBe('FIVE TWO ZERO ZERO')
  })

  it('converts 118.4 to ONE ONE EIGHT POINT FOUR', () => {
    expect(numberToSpoken('118.4')).toBe('ONE ONE EIGHT POINT FOUR')
  })

  it('converts 7700 to SEVEN SEVEN ZERO ZERO', () => {
    expect(numberToSpoken('7700')).toBe('SEVEN SEVEN ZERO ZERO')
  })
})

// ── gradeReadback helpers ─────────────────────────────────────────────────────

function makeItem(kind: ReadbackItem['kind'], value: string, hint: string): ReadbackItem {
  return { kind, value, hint }
}

// ── gradeReadback ─────────────────────────────────────────────────────────────

describe('gradeReadback', () => {
  it('scores 1.0 when all items are present', () => {
    const items: ReadbackItem[] = [
      makeItem('runway', 'RUNWAY ONE EIGHT', 'Read back the runway'),
      makeItem('squawk', '7700', 'Read back the squawk code'),
    ]
    const result = gradeReadback(
      'Runway City Ground, Cessna 123FS, runway one eight, squawk seven seven zero zero',
      items,
    )
    expect(result.score).toBe(1.0)
    expect(result.missing).toHaveLength(0)
    expect(result.feedback).toBe('Perfect readback.')
  })

  it('scores 0.0 when zero items are present', () => {
    const items: ReadbackItem[] = [
      makeItem('runway', 'RUNWAY ONE EIGHT', 'Read back the runway'),
      makeItem('squawk', '7700', 'Read back the squawk code'),
    ]
    const result = gradeReadback('Uh, roger that, thanks.', items)
    expect(result.score).toBe(0.0)
    expect(result.present).toHaveLength(0)
  })

  it('scores 0.5 when half the items are present', () => {
    const items: ReadbackItem[] = [
      makeItem('runway', 'RUNWAY ONE EIGHT', 'Read back the runway'),
      makeItem('squawk', '7700', 'Read back the squawk code'),
    ]
    const result = gradeReadback('Runway one eight, Cessna 123FS.', items)
    expect(result.score).toBe(0.5)
    expect(result.present).toHaveLength(1)
    expect(result.missing).toHaveLength(1)
  })

  it('recognises runway when pilot says "cleared to land runway one eight"', () => {
    const items: ReadbackItem[] = [makeItem('runway', '18', 'Read back the runway')]
    const result = gradeReadback('cleared to land runway one eight', items)
    expect(result.score).toBe(1.0)
  })

  it('recognises callsign with phonetic alphabet words', () => {
    const items: ReadbackItem[] = [
      makeItem(
        'callsign',
        'NOVEMBER ONE TWO THREE FOXTROT SIERRA',
        'Read back your callsign',
      ),
    ]
    const result = gradeReadback(
      'Runway City Ground, November one two three foxtrot sierra, FBO ramp, request taxi.',
      items,
    )
    expect(result.score).toBe(1.0)
    expect(result.present).toHaveLength(1)
  })

  it('recognises squawk code when pilot says "squawk seven seven zero zero"', () => {
    const items: ReadbackItem[] = [makeItem('squawk', '7700', 'Read back the squawk code')]
    const result = gradeReadback('squawk seven seven zero zero', items)
    expect(result.score).toBe(1.0)
  })

  it('is case-insensitive — lowercase pilot input works', () => {
    const items: ReadbackItem[] = [
      makeItem('runway', 'RUNWAY ONE EIGHT', 'Read back the runway'),
    ]
    const result = gradeReadback('runway one eight, wilco', items)
    expect(result.score).toBe(1.0)
  })

  it('gives "Good readback" feedback when score >= 0.5 but < 1.0', () => {
    const items: ReadbackItem[] = [
      makeItem('runway', 'RUNWAY ONE EIGHT', 'Read back the runway'),
      makeItem('altimeter', '29.92', 'Read back the altimeter setting'),
    ]
    const result = gradeReadback('runway one eight', items)
    expect(result.feedback).toMatch(/^Good readback/)
    expect(result.feedback).toContain('altimeter setting')
  })

  it('gives "Incomplete readback" feedback when score < 0.5', () => {
    const items: ReadbackItem[] = [
      makeItem('runway', 'RUNWAY ONE EIGHT', 'Read back the runway'),
      makeItem('squawk', '7700', 'Read back the squawk code'),
      makeItem('altimeter', '29.92', 'Read back the altimeter setting'),
    ]
    const result = gradeReadback('roger', items)
    expect(result.feedback).toMatch(/^Incomplete readback/)
  })

  it('handles digits in item value matching spoken form in pilot text', () => {
    const items: ReadbackItem[] = [makeItem('squawk', '5200', 'Read back the squawk code')]
    // pilot says spoken version
    const result = gradeReadback('squawk five two zero zero', items)
    expect(result.score).toBe(1.0)
  })

  it('handles empty required array — returns perfect score', () => {
    const result = gradeReadback('anything at all', [])
    expect(result.score).toBe(1.0)
    expect(result.feedback).toBe('Perfect readback.')
  })

  it('normalizeReadback expands phonetic words and is uppercase', () => {
    const result = normalizeReadback('november foxtrot sierra')
    expect(result).toBe('N F S')
  })
})
