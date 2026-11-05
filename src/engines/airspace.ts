// Airspace engine — FAA Aeronautical Information Manual (AIM), public domain.
// All data sourced from AIM Chapter 3 and Table 3-3-1.

export type AirspaceClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'G'
export type FlightRule = 'VFR' | 'IFR'

export interface WeatherMinimums {
  flightVisibilityMi: number | null  // null means "not applicable (IFR only)"
  cloudClearanceDesc: string         // human-readable: "1,000 ft above, 1,000 ft below, 1 mile horizontal"
  note?: string
}

export interface AirspaceInfo {
  cls: AirspaceClass
  name: string
  altitudeSummary: string            // e.g. "18,000 ft MSL and above (FL180–FL600)"
  radioRequired: boolean
  atcClearanceRequired: boolean
  transponderRequired: boolean
  operatingRulesNote: string         // key rule (IFR only, etc.)
  vfrMinimumsDay: WeatherMinimums
  vfrMinimumsNight: WeatherMinimums  // same structure, some classes differ at night
  color: string                      // hex color for the chart (traditional sectional colors)
}

// AIM Chapter 3 — Airspace | Table 3-3-1 — VFR Weather Minimums
// All data is from the AIM, public domain.
export const AIRSPACE_DATA: Record<AirspaceClass, AirspaceInfo> = {
  A: {
    cls: 'A',
    name: 'Class A',
    altitudeSummary: '18,000 ft MSL to FL600',
    radioRequired: true,
    atcClearanceRequired: true,
    transponderRequired: true,
    operatingRulesNote:
      'IFR only. All operations require an ATC clearance and IFR flight plan. No VFR.',
    vfrMinimumsDay: {
      flightVisibilityMi: null,
      cloudClearanceDesc: 'Not applicable — VFR flight not permitted in Class A.',
      note: 'VFR flight is not permitted in Class A airspace.',
    },
    vfrMinimumsNight: {
      flightVisibilityMi: null,
      cloudClearanceDesc: 'Not applicable — VFR flight not permitted in Class A.',
      note: 'VFR flight is not permitted in Class A airspace.',
    },
    color: '#6b7280',
  },

  B: {
    cls: 'B',
    name: 'Class B',
    altitudeSummary: 'Surface to 10,000 ft MSL (around major airports)',
    radioRequired: true,
    atcClearanceRequired: true,
    transponderRequired: true,
    operatingRulesNote:
      'ATC clearance required to enter. Mode C transponder required. Student pilots need specific endorsement.',
    vfrMinimumsDay: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: 'Clear of clouds',
    },
    vfrMinimumsNight: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: 'Clear of clouds',
    },
    color: '#3b82f6',
  },

  C: {
    cls: 'C',
    name: 'Class C',
    altitudeSummary: 'Surface to 4,000 ft AGL (around airports with radar approach control)',
    radioRequired: true,
    atcClearanceRequired: false,
    transponderRequired: true,
    operatingRulesNote:
      'Two-way radio communication must be established before entering. Mode C required.',
    vfrMinimumsDay: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: '500 ft below, 1,000 ft above, 2,000 ft horizontal',
    },
    vfrMinimumsNight: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: '500 ft below, 1,000 ft above, 2,000 ft horizontal',
    },
    color: '#8b5cf6',
  },

  D: {
    cls: 'D',
    name: 'Class D',
    altitudeSummary: 'Surface to 2,500 ft AGL (around airports with operating control towers)',
    radioRequired: true,
    atcClearanceRequired: false,
    transponderRequired: false,
    operatingRulesNote:
      'Two-way radio communication must be established before entering. Tower hours: check Chart Supplement.',
    vfrMinimumsDay: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: '500 ft below, 1,000 ft above, 2,000 ft horizontal',
    },
    vfrMinimumsNight: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: '500 ft below, 1,000 ft above, 2,000 ft horizontal',
    },
    color: '#60a5fa',
  },

  E: {
    cls: 'E',
    name: 'Class E',
    altitudeSummary:
      'Varies: 700 ft AGL (magenta vignette), 1,200 ft AGL (default), or 14,500 ft MSL',
    radioRequired: false,
    atcClearanceRequired: false,
    transponderRequired: false,
    operatingRulesNote:
      'No radio or clearance required for VFR. IFR requires ATC clearance. Transponder required above 10,000 ft MSL.',
    vfrMinimumsDay: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: '500 ft below, 1,000 ft above, 2,000 ft horizontal',
      note: 'At or above 10,000 ft MSL: 5 mi visibility, 1,000 ft below, 1,000 ft above, 1 mile horizontal.',
    },
    vfrMinimumsNight: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: '500 ft below, 1,000 ft above, 2,000 ft horizontal',
      note: 'At or above 10,000 ft MSL: 5 mi visibility, 1,000 ft below, 1,000 ft above, 1 mile horizontal.',
    },
    color: '#6366f1',
  },

  G: {
    cls: 'G',
    name: 'Class G (Uncontrolled)',
    altitudeSummary: 'Surface up to the base of overlying controlled airspace (varies)',
    radioRequired: false,
    atcClearanceRequired: false,
    transponderRequired: false,
    operatingRulesNote:
      'No radio, clearance, or transponder required. Most permissive airspace. Exercise caution.',
    vfrMinimumsDay: {
      flightVisibilityMi: 1,
      cloudClearanceDesc: 'Clear of clouds',
      note:
        'Below 1,200 ft AGL: 1 mi, clear of clouds. ' +
        '1,200–10,000 ft AGL: 1 mi, 500 ft below/1,000 ft above/2,000 ft horizontal. ' +
        'At or above 10,000 ft MSL: 5 mi, 1,000 ft below/1,000 ft above/1 mile horizontal.',
    },
    vfrMinimumsNight: {
      flightVisibilityMi: 3,
      cloudClearanceDesc: '500 ft below, 1,000 ft above, 2,000 ft horizontal',
      note: 'Night minimums below 1,200 ft AGL: 3 mi, 500 ft below/1,000 ft above/2,000 ft horizontal.',
    },
    color: '#f59e0b',
  },
}

// ── Helper functions ────────────────────────────────────────────────────────

export function getAirspaceByClass(cls: AirspaceClass): AirspaceInfo {
  return AIRSPACE_DATA[cls]
}

export function requiresRadio(cls: AirspaceClass): boolean {
  return AIRSPACE_DATA[cls].radioRequired
}

export function requiresClearance(cls: AirspaceClass): boolean {
  return AIRSPACE_DATA[cls].atcClearanceRequired
}

/**
 * Returns the VFR flight visibility minimum in statute miles for a given
 * airspace class and altitude MSL.  Returns null when VFR is not permitted.
 *
 * AIM Table 3-3-1 rules applied:
 *  - Class A: null (VFR not permitted)
 *  - Class B/C/D: 3 mi regardless of altitude
 *  - Class E / Class G at/above 10,000 ft MSL: 5 mi
 *  - Class E below 10,000 ft MSL: 3 mi
 *  - Class G below 1,200 ft AGL / MSL proxy (use 1,200 ft threshold): 1 mi day
 *    (This function uses altitudeMSL; for Class G we treat < 1200 as the low band)
 *  - Class G 1,200–10,000 ft MSL: 1 mi
 */
export function getVFRVisibilityMi(cls: AirspaceClass, altitudeMSL: number): number | null {
  if (cls === 'A') return null

  if (cls === 'B' || cls === 'C' || cls === 'D') return 3

  // Class E
  if (cls === 'E') {
    return altitudeMSL >= 10_000 ? 5 : 3
  }

  // Class G
  // Below 1,200 ft MSL (proxy for AGL in flat terrain): 1 mi
  // 1,200 to 10,000 ft: 1 mi
  // At or above 10,000 ft: 5 mi
  if (altitudeMSL >= 10_000) return 5
  return 1
}
