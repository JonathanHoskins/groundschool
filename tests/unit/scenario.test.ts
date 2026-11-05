import { describe, expect, it } from 'vitest'
import scenarioJson from '../../data/scenarios/teach1-vfr-departure.json'
import { ScenarioSchema } from '../../src/engines/schemas'
import type { Scenario, ScenarioStep } from '../../src/engines/schemas'
import {
  createSession,
  currentStep,
  requiresInput,
  advance,
  submit,
  stepCount,
  stepIndex,
} from '../../src/engines/scenario'

// ── Fixture helpers ───────────────────────────────────────────────────────────

// Parse once — all tests use this validated scenario
const scenario: Scenario = ScenarioSchema.parse(scenarioJson)

// ── 1. JSON validates against ScenarioSchema ──────────────────────────────────

describe('teach1-vfr-departure.json', () => {
  it('validates against ScenarioSchema without throwing', () => {
    expect(() => ScenarioSchema.parse(scenarioJson)).not.toThrow()
  })
})

// ── createSession ─────────────────────────────────────────────────────────────

describe('createSession', () => {
  it('sets currentStepId to scenario.startStepId', () => {
    const session = createSession(scenario)
    expect(session.currentStepId).toBe(scenario.startStepId)
  })

  it('starts with complete === false', () => {
    const session = createSession(scenario)
    expect(session.complete).toBe(false)
  })
})

// ── currentStep ───────────────────────────────────────────────────────────────

describe('currentStep', () => {
  it('returns the step matching startStepId', () => {
    const session = createSession(scenario)
    const step = currentStep(scenario, session)
    expect(step.id).toBe(scenario.startStepId)
  })
})

// ── requiresInput ─────────────────────────────────────────────────────────────

describe('requiresInput', () => {
  it('returns false for the ATIS step (ATC-only, no pilot action)', () => {
    const atisStep: ScenarioStep = scenario.steps['atis']!
    expect(requiresInput(atisStep)).toBe(false)
  })

  it('returns true for the ground_call step', () => {
    const groundCallStep: ScenarioStep = scenario.steps['ground_call']!
    expect(requiresInput(groundCallStep)).toBe(true)
  })
})

// ── advance ───────────────────────────────────────────────────────────────────

describe('advance', () => {
  it('moves from ATIS step to ground_call', () => {
    const session = createSession(scenario)
    // session starts at 'atis'
    const next = advance(scenario, session)
    expect(next.currentStepId).toBe('ground_call')
  })

  it('does not mutate the input session', () => {
    const session = createSession(scenario)
    const originalStepId = session.currentStepId
    advance(scenario, session)
    expect(session.currentStepId).toBe(originalStepId)
  })

  it('throws when called on a step that requires pilot input', () => {
    const session = createSession(scenario)
    const afterAtis = advance(scenario, session) // now at ground_call
    expect(() => advance(scenario, afterAtis)).toThrow()
  })
})

// ── submit ────────────────────────────────────────────────────────────────────

describe('submit', () => {
  it('advances to the next step when pilot input passes (score >= 0.5)', () => {
    // Navigate to ground_clearance (has 4 required items)
    const session0 = createSession(scenario)
    const session1 = advance(scenario, session0) // atis → ground_call

    // Pass ground_call with all required items
    const { session: session2 } = submit(
      scenario,
      session1,
      'Runway City Ground, Cessna November One Two Three Foxtrot Sierra, FBO ramp, request taxi to Runway One Eight.',
    )
    expect(session2.currentStepId).toBe('ground_clearance')

    // Now at ground_clearance — full readback with all 4 required items
    const { session: session3, grade, passed } = submit(
      scenario,
      session2,
      'Runway one eight, hold short zero niner two seven, altimeter two niner niner two, November one two three foxtrot sierra.',
    )
    expect(passed).toBe(true)
    expect(grade.score).toBeGreaterThanOrEqual(0.5)
    expect(session3.currentStepId).toBe('tower_call')
  })

  it('stays on the same step when pilot input fails (score < 0.5)', () => {
    const session0 = createSession(scenario)
    const session1 = advance(scenario, session0) // atis → ground_call

    const { session: session2, passed } = submit(scenario, session1, '')
    expect(passed).toBe(false)
    expect(session2.currentStepId).toBe('ground_call')
  })

  it('records a StepRecord in session.history', () => {
    const session0 = createSession(scenario)
    const session1 = advance(scenario, session0) // adds 1 record for atis

    const { session: session2 } = submit(
      scenario,
      session1,
      'Runway City Ground, November one two three foxtrot sierra, FBO, runway one eight.',
    )
    // history has: atis advance record + ground_call submit record
    const groundCallRecord = session2.history.find((r) => r.stepId === 'ground_call')
    expect(groundCallRecord).toBeDefined()
    expect(groundCallRecord?.pilotInput).not.toBeNull()
    expect(groundCallRecord?.grade).not.toBeNull()
  })

  it('does not mutate the input session', () => {
    const session0 = createSession(scenario)
    const session1 = advance(scenario, session0)
    const historyLengthBefore = session1.history.length
    submit(scenario, session1, '')
    expect(session1.history.length).toBe(historyLengthBefore)
  })
})

// ── stepCount ─────────────────────────────────────────────────────────────────

describe('stepCount', () => {
  it('returns 7 for the teach1-vfr-departure scenario', () => {
    expect(stepCount(scenario)).toBe(7)
  })
})

// ── stepIndex ─────────────────────────────────────────────────────────────────

describe('stepIndex', () => {
  it('starts at 0 for the initial step', () => {
    const session = createSession(scenario)
    expect(stepIndex(scenario, session)).toBe(0)
  })

  it('increases after advancing through steps', () => {
    const session0 = createSession(scenario)
    expect(stepIndex(scenario, session0)).toBe(0)

    const session1 = advance(scenario, session0) // atis → ground_call
    expect(stepIndex(scenario, session1)).toBe(1)
  })
})

// ── end-to-end: advance through all steps sets complete === true ───────────────

describe('complete scenario run', () => {
  it('advancing through all steps eventually sets session.complete === true', () => {
    let session = createSession(scenario)

    // Step 0: atis (ATC-only)
    session = advance(scenario, session)

    // Step 1: ground_call (pilot)
    ;({ session } = submit(
      scenario,
      session,
      'Runway City Ground, Cessna November one two three foxtrot sierra, FBO ramp, request taxi runway one eight.',
    ))

    // Step 2: ground_clearance (pilot)
    ;({ session } = submit(
      scenario,
      session,
      'Runway one eight, hold short zero niner two seven, altimeter two niner niner two, november one two three foxtrot sierra.',
    ))

    // Step 3: tower_call (pilot)
    ;({ session } = submit(
      scenario,
      session,
      'Runway City Tower, Cessna november one two three foxtrot sierra, holding short runway one eight, information alpha, ready for departure.',
    ))

    // Step 4: takeoff_clearance (pilot)
    ;({ session } = submit(
      scenario,
      session,
      'Cleared for takeoff runway one eight, departure one two four point zero, november one two three foxtrot sierra.',
    ))

    // Step 5: departure_contact (pilot)
    ;({ session } = submit(
      scenario,
      session,
      'Runway City Departure, Cessna november one two three foxtrot sierra, climbing through two thousand, VFR northbound.',
    ))

    // Step 6: complete (ATC-only, next.pass === 'COMPLETE')
    session = advance(scenario, session)

    expect(session.complete).toBe(true)
  })
})
