import { describe, expect, it } from 'vitest'
import {
  calcLoadFactor,
  calcTurnStallSpeed,
  calcCL,
  calcAero,
  calcLift,
  knotsToFtPerSec,
  CRITICAL_AOA_DEG,
  CL_MAX,
} from '../../src/engines/aero'

describe('calcLoadFactor', () => {
  it('returns 1.0 in level flight (0° bank)', () => {
    expect(calcLoadFactor(0)).toBe(1.0)
  })

  it('is approximately 2.0 at 60° bank', () => {
    expect(calcLoadFactor(60)).toBeCloseTo(2.0, 1)
  })

  it('is approximately 1.41 at 45° bank', () => {
    expect(calcLoadFactor(45)).toBeCloseTo(1.41, 1)
  })
})

describe('calcTurnStallSpeed', () => {
  it('returns approximately 67.9 kt for Vs=48 kt and loadFactor=2.0', () => {
    expect(calcTurnStallSpeed(48, 2.0)).toBeCloseTo(67.9, 0)
  })

  it('returns 48 kt at load factor 1.0 (level flight)', () => {
    expect(calcTurnStallSpeed(48, 1.0)).toBe(48)
  })
})

describe('calcCL', () => {
  it('returns 0 at AoA = 0°', () => {
    expect(calcCL(0)).toBe(0)
  })

  it('returns 1.0 at AoA = 10° (10 × 0.1)', () => {
    expect(calcCL(10)).toBe(1.0)
  })

  it('returns CL_MAX (1.6) at critical AoA', () => {
    expect(calcCL(CRITICAL_AOA_DEG)).toBe(CL_MAX)
  })
})

describe('calcAero', () => {
  it('isStalled is true above critical AoA', () => {
    const result = calcAero(CRITICAL_AOA_DEG + 1, 60, 0, 48)
    expect(result.isStalled).toBe(true)
  })

  it('isStalled is false below critical AoA', () => {
    const result = calcAero(10, 100, 0, 48)
    expect(result.isStalled).toBe(false)
  })
})

describe('knotsToFtPerSec', () => {
  it('converts 60 kt to approximately 101.3 ft/s', () => {
    expect(knotsToFtPerSec(60)).toBeCloseTo(101.3, 0)
  })
})

describe('lift behavior', () => {
  it('lift increases as airspeed increases at the same AoA', () => {
    const liftSlow = calcLift(60, 1.0)
    const liftFast = calcLift(120, 1.0)
    expect(liftFast).toBeGreaterThan(liftSlow)
  })

  it('CL and lift are both 0 when AoA = 0', () => {
    const cl = calcCL(0)
    expect(cl).toBe(0)
    const lift = calcLift(100, cl)
    expect(lift).toBe(0)
  })
})
