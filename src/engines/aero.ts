// Aerodynamics engine — PHAK Chapters 4–5 (FAA-H-8083-25B), public domain.
// All aircraft constants are PLACEHOLDER values and must be verified against the C172S POH.

// Standard ISA sea-level constants
const RHO_SL_SLUG_FT3 = 0.002378 // slug/ft³ — standard sea level air density
const C172S_WING_AREA_FT2 = 174   // ft² — PLACEHOLDER, verify against POH
const C172S_CL_SLOPE = 0.1        // CL per degree AoA (linear approximation, PLACEHOLDER)
const C172S_CRITICAL_AOA_DEG = 17 // degrees — approximate stall AoA (PLACEHOLDER)
const C172S_CL_MAX = 1.6          // at critical AoA (PLACEHOLDER)
const C172S_CD0 = 0.027           // parasite drag coefficient (PLACEHOLDER)
const C172S_K = 0.055             // induced drag factor k (PLACEHOLDER)

// Re-export constants so tests and consumers can reference them
export const CRITICAL_AOA_DEG = C172S_CRITICAL_AOA_DEG
export const CL_MAX = C172S_CL_MAX

// Speed conversion
export function knotsToFtPerSec(kts: number): number {
  return kts * 1.68781
}

// Lift coefficient: linear up to critical AoA, then drops sharply
export function calcCL(aoaDeg: number): number {
  if (aoaDeg >= C172S_CRITICAL_AOA_DEG) {
    // Post-stall: CL drops sharply
    const excess = aoaDeg - C172S_CRITICAL_AOA_DEG
    return Math.max(0, C172S_CL_MAX - excess * 0.15)
  }
  return Math.max(0, C172S_CL_SLOPE * aoaDeg)
}

// Drag coefficient (parabolic polar)
export function calcCD(cl: number): number {
  return C172S_CD0 + C172S_K * cl * cl
}

// Lift force in lbs
export function calcLift(airspeedKt: number, cl: number): number {
  const v = knotsToFtPerSec(airspeedKt)
  return 0.5 * RHO_SL_SLUG_FT3 * v * v * cl * C172S_WING_AREA_FT2
}

// Drag force in lbs
export function calcDrag(airspeedKt: number, cd: number): number {
  const v = knotsToFtPerSec(airspeedKt)
  return 0.5 * RHO_SL_SLUG_FT3 * v * v * cd * C172S_WING_AREA_FT2
}

// Load factor in a coordinated turn
export function calcLoadFactor(bankDeg: number): number {
  const bankRad = (bankDeg * Math.PI) / 180
  if (bankDeg >= 90) return Infinity
  return 1 / Math.cos(bankRad)
}

// Stall speed at given load factor (Vs in a turn)
// Vs_turn = Vs_1g * sqrt(loadFactor)
export function calcTurnStallSpeed(vs1gKt: number, loadFactor: number): number {
  return vs1gKt * Math.sqrt(loadFactor)
}

export interface AeroResult {
  cl: number
  cd: number
  liftLb: number
  dragLb: number
  loadFactor: number
  turnStallSpeedKt: number
  isStalled: boolean
}

export function calcAero(
  aoaDeg: number,
  airspeedKt: number,
  bankDeg: number,
  vs1gKt: number,
): AeroResult {
  const cl = calcCL(aoaDeg)
  const cd = calcCD(cl)
  const liftLb = calcLift(airspeedKt, cl)
  const dragLb = calcDrag(airspeedKt, cd)
  const loadFactor = calcLoadFactor(bankDeg)
  const turnStallSpeedKt = calcTurnStallSpeed(vs1gKt, loadFactor)
  const isStalled = aoaDeg >= C172S_CRITICAL_AOA_DEG

  return { cl, cd, liftLb, dragLb, loadFactor, turnStallSpeedKt, isStalled }
}
