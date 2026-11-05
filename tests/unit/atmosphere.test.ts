import { describe, expect, it } from 'vitest'
import { altitudeToInHg } from '../../src/engines/atmosphere'

// PHAK Chapter 4 / FAA-H-8083-25B Table 4-1 (Standard Atmosphere)
// Sea level: 29.92 inHg
// 1,000 ft:  28.86 inHg
// 5,000 ft:  24.90 inHg
// 10,000 ft: 20.58 inHg
// 18,000 ft: 14.94 inHg

describe('altitudeToInHg', () => {
  it('returns sea-level pressure at 0 ft', () => {
    expect(altitudeToInHg(0)).toBeCloseTo(29.92, 1)
  })

  it('returns ~28.86 inHg at 1,000 ft', () => {
    expect(altitudeToInHg(1000)).toBeCloseTo(28.86, 1)
  })

  it('returns ~24.90 inHg at 5,000 ft', () => {
    expect(altitudeToInHg(5000)).toBeCloseTo(24.9, 1)
  })

  it('returns ~20.58 inHg at 10,000 ft', () => {
    expect(altitudeToInHg(10000)).toBeCloseTo(20.58, 1)
  })

  it('pressure decreases monotonically with altitude', () => {
    const altitudes = [0, 1000, 5000, 10000, 15000, 18000]
    const pressures = altitudes.map(altitudeToInHg)
    for (let i = 1; i < pressures.length; i++) {
      expect(pressures[i]).toBeLessThan(pressures[i - 1]!)
    }
  })
})
