import { describe, expect, it } from 'vitest'
import {
  requiresRadio,
  requiresClearance,
  getAirspaceByClass,
  getVFRVisibilityMi,
} from '../../src/engines/airspace'

describe('requiresRadio', () => {
  it('Class A requires radio', () => {
    expect(requiresRadio('A')).toBe(true)
  })
  it('Class B requires radio', () => {
    expect(requiresRadio('B')).toBe(true)
  })
  it('Class C requires radio', () => {
    expect(requiresRadio('C')).toBe(true)
  })
  it('Class D requires radio', () => {
    expect(requiresRadio('D')).toBe(true)
  })
  it('Class E does not require radio', () => {
    expect(requiresRadio('E')).toBe(false)
  })
  it('Class G does not require radio', () => {
    expect(requiresRadio('G')).toBe(false)
  })
})

describe('requiresClearance', () => {
  it('Class A requires ATC clearance', () => {
    expect(requiresClearance('A')).toBe(true)
  })
  it('Class B requires ATC clearance', () => {
    expect(requiresClearance('B')).toBe(true)
  })
  it('Class C does not require ATC clearance (radio contact only)', () => {
    expect(requiresClearance('C')).toBe(false)
  })
  it('Class D does not require ATC clearance (radio contact only)', () => {
    expect(requiresClearance('D')).toBe(false)
  })
  it('Class E does not require ATC clearance for VFR', () => {
    expect(requiresClearance('E')).toBe(false)
  })
  it('Class G does not require ATC clearance', () => {
    expect(requiresClearance('G')).toBe(false)
  })
})

describe('getAirspaceByClass', () => {
  it('Class B VFR day visibility is 3 statute miles', () => {
    expect(getAirspaceByClass('B').vfrMinimumsDay.flightVisibilityMi).toBe(3)
  })

  it('Class G VFR day visibility at low altitude is 1 statute mile', () => {
    expect(getAirspaceByClass('G').vfrMinimumsDay.flightVisibilityMi).toBe(1)
  })

  it('Class A VFR minimums are null — VFR not permitted', () => {
    expect(getAirspaceByClass('A').vfrMinimumsDay.flightVisibilityMi).toBeNull()
  })

  it('Class C VFR day cloud clearance is 500/1000/2000', () => {
    expect(getAirspaceByClass('C').vfrMinimumsDay.cloudClearanceDesc).toBe(
      '500 ft below, 1,000 ft above, 2,000 ft horizontal',
    )
  })

  it('Class D transponder is not required', () => {
    expect(getAirspaceByClass('D').transponderRequired).toBe(false)
  })

  it('Class B transponder is required', () => {
    expect(getAirspaceByClass('B').transponderRequired).toBe(true)
  })

  it('Class A operatingRulesNote mentions IFR only', () => {
    expect(getAirspaceByClass('A').operatingRulesNote).toMatch(/IFR only/i)
  })
})

describe('getVFRVisibilityMi', () => {
  it('returns null for Class A (VFR not permitted)', () => {
    expect(getVFRVisibilityMi('A', 20_000)).toBeNull()
  })

  it('returns 3 for Class B at any altitude', () => {
    expect(getVFRVisibilityMi('B', 5_000)).toBe(3)
    expect(getVFRVisibilityMi('B', 15_000)).toBe(3)
  })

  it('returns 3 for Class C below 10,000 ft', () => {
    expect(getVFRVisibilityMi('C', 3_000)).toBe(3)
  })

  it('returns 3 for Class D at typical altitude', () => {
    expect(getVFRVisibilityMi('D', 2_000)).toBe(3)
  })

  it('returns 3 for Class E below 10,000 ft MSL', () => {
    expect(getVFRVisibilityMi('E', 5_000)).toBe(3)
  })

  it('returns 5 for Class E at or above 10,000 ft MSL', () => {
    expect(getVFRVisibilityMi('E', 10_000)).toBe(5)
    expect(getVFRVisibilityMi('E', 12_500)).toBe(5)
  })

  it('returns 1 for Class G below 10,000 ft MSL', () => {
    expect(getVFRVisibilityMi('G', 800)).toBe(1)
    expect(getVFRVisibilityMi('G', 5_000)).toBe(1)
  })

  it('returns 5 for Class G at or above 10,000 ft MSL', () => {
    expect(getVFRVisibilityMi('G', 10_000)).toBe(5)
  })
})
