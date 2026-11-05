// Standard atmosphere (ISA) pressure vs altitude.
// Source: PHAK Chapter 4; U.S. Standard Atmosphere 1976
// Formula: p = p0 * (1 - L*h/T0)^(g*M/(R*L))
// Simplified to the barometric formula valid below the tropopause (~36,089 ft).

const P0_IN_HG = 29.92 // sea-level pressure, inHg
const T0_K = 288.15 // sea-level temperature, Kelvin (15 °C)
const L = 0.0065 // temperature lapse rate, K/m
const G = 9.80665 // gravity, m/s²
const M = 0.0289644 // molar mass of air, kg/mol
const R = 8.31447 // universal gas constant, J/(mol·K)

const EXPONENT = (G * M) / (R * L) // ≈ 5.2561

function ftToM(ft: number): number {
  return ft * 0.3048
}

/**
 * Returns the standard-atmosphere pressure at the given pressure altitude in feet.
 * Result is in inches of mercury (inHg).
 *
 * Valid for altitudes 0–36,089 ft (troposphere only).
 * Simplification: standard ISA conditions assumed; no temperature deviation.
 */
export function altitudeToInHg(altitudeFt: number): number {
  const hM = ftToM(altitudeFt)
  return P0_IN_HG * Math.pow(1 - (L * hM) / T0_K, EXPONENT)
}
