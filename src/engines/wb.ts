// Source: PHAK Chapter 10 (FAA-H-8083-25B), public domain

export interface LoadStation {
  id: string
  name: string
  armIn: number
  weightLb: number
}

export interface WBResult {
  totalWeightLb: number
  totalMomentInLb: number
  cgIn: number
  withinNormal: boolean
  withinUtility: boolean
}

// Point is [armIn, weightLb]
type Envelope = [number, number][]

export function calcMoment(weightLb: number, armIn: number): number {
  return weightLb * armIn
}

export function calcCG(totalMomentInLb: number, totalWeightLb: number): number {
  if (totalWeightLb === 0) return 0
  return totalMomentInLb / totalWeightLb
}

/**
 * Returns true if (cgIn, weightLb) is inside the polygon defined by envelope points.
 * Envelope points are [armIn, weightLb] pairs forming a closed polygon.
 * Uses ray casting algorithm.
 */
export function isInEnvelope(cgIn: number, weightLb: number, envelope: Envelope): boolean {
  let inside = false
  const n = envelope.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = envelope[i]!
    const [xj, yj] = envelope[j]!
    const crossesY = (yi > weightLb) !== (yj > weightLb)
    const xIntercept = ((xj - xi) * (weightLb - yi)) / (yj - yi) + xi
    if (crossesY && cgIn < xIntercept) inside = !inside
  }
  return inside
}

export function calcWB(
  emptyWeightLb: number,
  emptyArmIn: number,
  stations: LoadStation[],
  normalEnvelope: Envelope,
  utilityEnvelope?: Envelope,
): WBResult {
  let totalWeightLb = emptyWeightLb
  let totalMomentInLb = emptyWeightLb * emptyArmIn

  for (const s of stations) {
    totalWeightLb += s.weightLb
    totalMomentInLb += s.weightLb * s.armIn
  }

  const cgIn = calcCG(totalMomentInLb, totalWeightLb)
  const withinNormal = isInEnvelope(cgIn, totalWeightLb, normalEnvelope)
  const withinUtility = utilityEnvelope
    ? isInEnvelope(cgIn, totalWeightLb, utilityEnvelope)
    : false

  return { totalWeightLb, totalMomentInLb, cgIn, withinNormal, withinUtility }
}
