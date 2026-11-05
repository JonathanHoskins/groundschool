// ATC Scenario state machine engine — Phase 3
// Pure TypeScript, no React imports.

import type { Scenario, ScenarioStep } from './schemas'
import { gradeReadback } from './readback'
import type { GradeResult, ReadbackItem as ReadbackEngineItem, ReadbackKind } from './readback'

// Map schema ReadbackItem (no hint) to readback engine ReadbackItem (with hint)
// Exported so the UI can display hints
export const READBACK_HINTS: Record<string, string> = {
  callsign: 'Your callsign must be in the readback',
  runway: 'The runway assignment must be read back',
  holdShort: 'The hold-short instruction must be read back',
  route: 'Your position or route must be mentioned',
  altitude: 'The altitude must be read back',
  heading: 'The heading must be read back',
  squawk: 'The squawk code must be read back',
  frequency: 'The departure frequency must be read back',
  altimeter: 'The altimeter setting must be read back',
}

// Map schema ReadbackItem kind to ReadbackEngineItem kind.
// schemas.ts uses 'route'; readback.ts uses 'taxiRoute'.
// All other kinds are identical between the two.
function toEngineKind(schemaKind: string): ReadbackKind {
  if (schemaKind === 'route') return 'taxiRoute'
  return schemaKind as ReadbackKind
}

function toEngineItem(item: { kind: string; value: string }): ReadbackEngineItem {
  return {
    kind: toEngineKind(item.kind),
    value: item.value,
    hint: READBACK_HINTS[item.kind] ?? `The ${item.kind} must be read back`,
  }
}

export interface StepRecord {
  stepId: string
  pilotInput: string | null   // null = no pilot action on this step (ATC-only)
  grade: GradeResult | null
  passed: boolean
}

export interface ScenarioSession {
  scenarioId: string
  currentStepId: string
  history: StepRecord[]
  complete: boolean
}

// Create initial session for a scenario
export function createSession(scenario: Scenario): ScenarioSession {
  return {
    scenarioId: scenario.id,
    currentStepId: scenario.startStepId,
    history: [],
    complete: false,
  }
}

// Get the current step object
export function currentStep(scenario: Scenario, session: ScenarioSession): ScenarioStep {
  const step = scenario.steps[session.currentStepId]
  if (step === undefined) {
    throw new Error(`Step "${session.currentStepId}" not found in scenario "${scenario.id}"`)
  }
  return step
}

// True if this step requires typed pilot input
export function requiresInput(step: ScenarioStep): boolean {
  return step.pilot !== undefined
}

// Advance an ATC-only step (no pilot action). Throws if step requires input.
// Returns a new session object (immutable — does not mutate input).
export function advance(scenario: Scenario, session: ScenarioSession): ScenarioSession {
  if (session.complete) {
    return session
  }

  const step = currentStep(scenario, session)

  if (requiresInput(step)) {
    throw new Error(
      `Step "${step.id}" requires pilot input. Use submit() instead of advance().`,
    )
  }

  const record: StepRecord = {
    stepId: step.id,
    pilotInput: null,
    grade: null,
    passed: true,
  }

  const nextStepId = step.next.pass
  const isComplete = nextStepId === 'COMPLETE'

  return {
    ...session,
    history: [...session.history, record],
    currentStepId: isComplete ? session.currentStepId : nextStepId,
    complete: isComplete,
  }
}

// Submit pilot input for the current step. Grades against required items.
// If grade.score >= 0.5: advances to next step (pass path).
// If grade.score < 0.5: stays on the same step.
// Always records a StepRecord in history.
// Returns new session and the grade result. Immutable.
export function submit(
  scenario: Scenario,
  session: ScenarioSession,
  pilotText: string,
): { session: ScenarioSession; grade: GradeResult; passed: boolean } {
  if (session.complete) {
    const emptyGrade: GradeResult = {
      score: 1.0,
      missing: [],
      present: [],
      feedback: 'Scenario is already complete.',
    }
    return { session, grade: emptyGrade, passed: false }
  }

  const step = currentStep(scenario, session)

  if (!requiresInput(step)) {
    throw new Error(
      `Step "${step.id}" has no pilot action. Use advance() instead of submit().`,
    )
  }

  // step.pilot is defined here (requiresInput returned true)
  const required = step.pilot!.required.map(toEngineItem)
  const grade = gradeReadback(pilotText, required)
  const passed = grade.score >= 0.5

  const record: StepRecord = {
    stepId: step.id,
    pilotInput: pilotText,
    grade,
    passed,
  }

  if (passed) {
    const nextStepId = step.next.pass
    const isComplete = nextStepId === 'COMPLETE'

    const newSession: ScenarioSession = {
      ...session,
      history: [...session.history, record],
      currentStepId: isComplete ? session.currentStepId : nextStepId,
      complete: isComplete,
    }
    return { session: newSession, grade, passed }
  } else {
    // Stay on the same step
    const newSession: ScenarioSession = {
      ...session,
      history: [...session.history, record],
    }
    return { session: newSession, grade, passed }
  }
}

// Total number of steps in the scenario (count of keys in steps object)
export function stepCount(scenario: Scenario): number {
  return Object.keys(scenario.steps).length
}

// 0-based index of the current step in insertion order
export function stepIndex(scenario: Scenario, session: ScenarioSession): number {
  return Object.keys(scenario.steps).indexOf(session.currentStepId)
}
