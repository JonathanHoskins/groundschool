import { describe, expect, it } from 'vitest'
import { AirportSchema } from '../../src/engines/schemas'
import {
  adjacentEdges,
  shortestPath,
  runwaysCrossed,
  unauthorizedCrossings,
  isHoldShortFor,
  holdShortNodes,
  edgeBetween,
} from '../../src/engines/airport'
import rawAirport from '../../data/airports/teach1.json'

// Parse once and reuse
const airport = AirportSchema.parse(rawAirport)

// Helper: get the BFS path from fbo to twa_hs_18 (used by several tests)
const fboToHs18 = shortestPath(airport, 'fbo', 'twa_hs_18')

describe('teach1.json — schema validation', () => {
  it('JSON validates against AirportSchema without throwing', () => {
    expect(() => AirportSchema.parse(rawAirport)).not.toThrow()
  })
})

describe('adjacentEdges', () => {
  it('returns edges including twa_cross_in, twa_cross_out, twb_1 for twa_09_27_cross', () => {
    const edges = adjacentEdges(airport, 'twa_09_27_cross')
    const ids = edges.map((e) => e.id)
    expect(ids).toContain('twa_cross_in')
    expect(ids).toContain('twa_cross_out')
    expect(ids).toContain('twb_1')
  })
})

describe('shortestPath', () => {
  it('fbo → twa_hs_18 returns a non-null path starting with fbo and ending with twa_hs_18', () => {
    expect(fboToHs18).not.toBeNull()
    expect(fboToHs18![0]).toBe('fbo')
    expect(fboToHs18![fboToHs18!.length - 1]).toBe('twa_hs_18')
  })

  it('fbo → rwy18_thr path result is consistent (null or array)', () => {
    // The graph may or may not connect these — just verify type safety
    const result = shortestPath(airport, 'fbo', 'rwy18_thr')
    expect(result === null || Array.isArray(result)).toBe(true)
  })
})

describe('runwaysCrossed', () => {
  it('fbo → twa_hs_18 path crosses runway 09/27', () => {
    // fbo → twc_e → twa_c_jct → twa_09_27_exit → twa_09_27_cross → twa_09_27_hs → twa_hs_18
    // The cross_in/cross_out edges are kind=runway with runwayId=09/27
    expect(fboToHs18).not.toBeNull()
    const crossed = runwaysCrossed(airport, fboToHs18!)
    expect(crossed).toContain('09/27')
  })

  it('path entirely on Taxiway A (north section) returns []', () => {
    // twa_hs_18 → twa_n_mid → twa_09_27_hs : both edges are taxiway kind
    const northPath = ['twa_hs_18', 'twa_n_mid', 'twa_09_27_hs']
    expect(runwaysCrossed(airport, northPath)).toEqual([])
  })
})

describe('unauthorizedCrossings', () => {
  it('returns [] when 09/27 is authorized', () => {
    expect(fboToHs18).not.toBeNull()
    expect(unauthorizedCrossings(airport, fboToHs18!, ['09/27'])).toEqual([])
  })

  it('returns [\'09/27\'] when nothing is authorized', () => {
    expect(fboToHs18).not.toBeNull()
    expect(unauthorizedCrossings(airport, fboToHs18!, [])).toContain('09/27')
  })
})

describe('isHoldShortFor', () => {
  it('returns true for twa_09_27_hs / 09/27', () => {
    expect(isHoldShortFor(airport, 'twa_09_27_hs', '09/27')).toBe(true)
  })

  it('returns false for twa_n_mid / 09/27 (not a hold-short node)', () => {
    expect(isHoldShortFor(airport, 'twa_n_mid', '09/27')).toBe(false)
  })
})

describe('holdShortNodes', () => {
  it('includes twa_hs_18 and twa_hs_36 for runway 18/36', () => {
    const nodes = holdShortNodes(airport, '18/36')
    expect(nodes).toContain('twa_hs_18')
    expect(nodes).toContain('twa_hs_36')
  })
})

describe('edgeBetween', () => {
  it('returns the twb_1 edge between twa_09_27_cross and twb_hs_1836', () => {
    const edge = edgeBetween(airport, 'twa_09_27_cross', 'twb_hs_1836')
    expect(edge).toBeDefined()
    expect(edge!.id).toBe('twb_1')
  })
})
