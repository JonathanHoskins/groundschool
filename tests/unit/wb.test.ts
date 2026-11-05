import { describe, expect, it } from 'vitest'
import { calcMoment, calcCG, isInEnvelope, calcWB } from '../../src/engines/wb'

const NORMAL_ENVELOPE: [number, number][] = [
  [35, 1500],
  [47.3, 1500],
  [47.3, 2550],
  [35, 2550],
]

describe('calcMoment', () => {
  it('returns 6290 for 170 lb at 37.0 in', () => {
    expect(calcMoment(170, 37.0)).toBe(6290)
  })
})

describe('calcCG', () => {
  it('returns 40.0 for moment 80000 in-lb and weight 2000 lb', () => {
    expect(calcCG(80000, 2000)).toBe(40.0)
  })

  it('returns 0 when weight is zero', () => {
    expect(calcCG(0, 0)).toBe(0)
  })
})

describe('isInEnvelope', () => {
  it('returns true for (40, 2000) — normal loaded, inside envelope', () => {
    expect(isInEnvelope(40, 2000, NORMAL_ENVELOPE)).toBe(true)
  })

  it('returns false for (34, 2000) — forward of forward limit', () => {
    expect(isInEnvelope(34, 2000, NORMAL_ENVELOPE)).toBe(false)
  })

  it('returns false for (48, 2000) — aft of aft limit', () => {
    expect(isInEnvelope(48, 2000, NORMAL_ENVELOPE)).toBe(false)
  })

  it('returns false for (40, 2600) — overweight', () => {
    expect(isInEnvelope(40, 2600, NORMAL_ENVELOPE)).toBe(false)
  })
})

describe('calcWB', () => {
  it('computes correct totals for a typical load', () => {
    // Empty: 1634 lb @ 39.5 in
    // Front pax: 170 lb @ 37.0 in
    // Fuel: 30 gal × 6 lb/gal = 180 lb @ 48.0 in
    // Total weight: 1634 + 170 + 180 = 1984 lb
    // Total moment: (1634×39.5) + (170×37.0) + (180×48.0) = 64543 + 6290 + 8640 = 79473 in-lb
    // CG: 79473 / 1984 ≈ 40.056 in
    const stations = [
      { id: 'frontSeats', name: 'Front seats', armIn: 37.0, weightLb: 170 },
      { id: 'fuel',       name: 'Fuel',        armIn: 48.0, weightLb: 180 },
    ]

    const result = calcWB(1634, 39.5, stations, NORMAL_ENVELOPE)

    expect(result.totalWeightLb).toBe(1984)
    expect(result.cgIn).toBeCloseTo(40.06, 1)
    expect(result.withinNormal).toBe(true)
  })

  it('returns withinUtility false when no utility envelope is provided', () => {
    const stations = [
      { id: 'frontSeats', name: 'Front seats', armIn: 37.0, weightLb: 170 },
    ]
    const result = calcWB(1634, 39.5, stations, NORMAL_ENVELOPE)
    expect(result.withinUtility).toBe(false)
  })

  it('returns withinNormal false for aft-heavy loading (CG ≈ 48.7 in, beyond 47.3 in limit)', () => {
    // Empty: 1634 lb @ 39.5 in  → moment 64543
    // Rear pax: 400 lb @ 73.0 in → moment 29200
    // Baggage A: 120 lb @ 95.0 in → moment 11400
    // Total weight: 2154 lb, total moment: 105143 in-lb
    // CG: 105143 / 2154 ≈ 48.81 in — aft of 47.3 in limit
    const stations = [
      { id: 'rearSeats', name: 'Rear seats',  armIn: 73.0, weightLb: 400 },
      { id: 'baggageA',  name: 'Baggage A',   armIn: 95.0, weightLb: 120 },
    ]

    const result = calcWB(1634, 39.5, stations, NORMAL_ENVELOPE)

    expect(result.withinNormal).toBe(false)
  })
})
