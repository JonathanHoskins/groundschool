# Project Plan: Interactive Private Pilot Ground School

> Working name: **TBD** (see Open Decisions)
> Status: Planning complete, Phase 0 next
> Owner: Jonathan

---

## 1. Vision

A clean, modern, app-like website that teaches private pilot (airplane, single-engine land) ground knowledge by **interaction instead of memorization**. You manipulate a model, watch what happens, then answer questions that require using what you just saw.

It also covers what most ground schools skip or rush: **finding your way around an airport** and **talking to ATC**, so a student can arrive at their first lesson already comfortable on the ground and on the radio.

**It is a study aid, not an FAA-approved course.** It does not provide the endorsement needed to take the FAA knowledge test. Students pair it with an approved course and a CFI.

## 2. Principles

1. **Every lesson has a loop:** short explanation, then a simulation, then questions that make you use the simulation.
2. **Accuracy is non-negotiable.** Every sim states its simplifications on screen, and every calculation has tests against FAA or POH worked examples.
3. **Mobile-first.** Drill on your phone, with richer sims on desktop.
4. **Data, not code, for content.** Aircraft, airports, scenarios, and questions live in data files, so adding content never requires engine changes.
5. **Privacy-respecting.** No cookies, no tracking beyond anonymous aggregate analytics.
6. **Accessible.** Color is never the only cue.

## 3. Audience and positioning

- **Primary:** prospective and early student pilots, especially visual and hands-on learners.
- **Secondary:** pilots refreshing for a flight review, and CFIs using sims as teaching aids.
- **Positioning:** complements Sporty's, King, Pilot Institute, Gleim, and similar courses rather than competing with them on endorsements. The differentiator is interactivity, airport surface ops, and ATC practice.

## 4. Content sources and accuracy

| Source | Use | Rights |
|---|---|---|
| Private Pilot Airman Certification Standards (ACS) | Defines what is tested; every lesson and question maps to ACS task codes | Public domain (FAA) |
| Pilot's Handbook of Aeronautical Knowledge (PHAK) | Explanations, figures, worked examples for test cases | Public domain (FAA) |
| Airplane Flying Handbook (AFH) | Traffic patterns, ground ops, maneuvers context | Public domain (FAA) |
| Aeronautical Information Manual (AIM) | Airport ops, signs, markings, lighting, radio procedures | Public domain (FAA) |
| Pilot/Controller Glossary | Authentic phraseology | Public domain (FAA) |
| FAA Order JO 7110.65 (controller handbook) | Authentic ATC phrasing in scenarios | Public domain (FAA) |
| FAA airport diagrams and Chart Supplement | Real airport data (starting with KCHA) | Public domain (FAA) |
| Cessna 172S POH | Weights, arms, envelope, performance numbers | Copyrighted document. Use the facts and numbers only. Redraw all charts; never scan or copy pages. |
| FAA published sample knowledge test questions | Supplementary practice | Public domain (FAA) |

The FAA no longer publishes the real knowledge test question bank. All other questions are original, written to the ACS.

**Accuracy process**
- Every simulation lists its simplifications on screen (for example, "lift model is linear up to the critical angle of attack").
- Every calculation module has unit tests built from PHAK or POH worked examples.
- Every lesson and question records its source references.
- **CFI review** is required before public launch for regulations, airspace, airport operations, and ATC content. Plan for this as a paid or credited reviewer.

## 5. Modules

Each module lists its sims and drills. ACS mappings are recorded per lesson in content frontmatter.

### 5.1 Weight and balance
- Load stations (front seats, rear seats, baggage areas, fuel) with live CG plotted on the 172S envelope.
- Fuel burn animation showing CG movement during flight.
- "Make it legal" challenges: given an overloaded or out-of-CG scenario, fix it.

### 5.2 Aerodynamics explorer
- Sliders for angle of attack, airspeed, and bank angle driving lift, drag, load factor, and stall speed.
- Shows why stall speed rises in a turn; four forces in climbs, descents, and turns.

### 5.3 Airspace trainer
- Cutaway view of Class B, C, D, E, and G with altitudes.
- Tap-to-identify drills on a simplified sectional.
- Weather minimums and entry or equipment requirements per class.

### 5.4 Density altitude and performance
- Temperature, altimeter setting, and field elevation feed pressure and density altitude.
- Takeoff distance and climb performance from 172S tables.

### 5.5 Airport surface operations
- **Signs and markings:** mandatory, location, direction, destination signs; hold-short lines; ILS critical areas; runway and threshold markings; displaced thresholds. Questions ask "what do you do here?" not only "what is this?"
- **Taxi route tracer:** given a clearance ("Taxi to Runway X via A, C, hold short of Runway Y"), draw the route on the diagram. Flags wrong turns and, above all, any unauthorized runway crossing.
- **Lighting and night ops:** runway and taxiway lighting, VASI/PAPI with an approach slider, pilot-controlled lighting.
- **Traffic pattern:** standard entry, legs, and altitudes; reading wind indicators and segmented circles at non-towered fields.
- **Airport data:** start with a fictional teaching airport designed to include every sign type and a couple of hotspots. Then add real airports from FAA diagrams, starting with **KCHA** (Class C) plus a nearby non-towered field.

### 5.6 ATC and radio communications
- **Basics:** phonetic alphabet, aviation numbers, the "who you're calling, who you are, where you are, what you want" format, and a call-building drill.
- **Scripted scenario simulator:** full flights across ATIS, clearance or ground, tower, departure, flight following, and the return. ATC speaks via browser text-to-speech; the student responds and is graded on required readback items.
- **Non-towered (CTAF) mode:** position reports with simulated traffic to sequence behind.
- **Light gun signals and lost comms.**
- **Local realism:** KCHA scenarios include local requirements from the Chart Supplement, such as reading back all hold-short instructions.
- **Input modes (built in this order):**
  1. Typed readbacks, graded item by item.
  2. Speak and self-check: record your readback, play it next to the correct one, self-grade. Uses standard browser audio recording, so it works in all browsers.
  3. Graded voice: speech recognition plus a normalization layer ("niner", "tree", tail numbers, frequencies) feeding the same grader, with a "here's what I heard, correct it" fallback.
- **Core rule:** the scenario engine only ever receives normalized text. It never knows whether input came from a keyboard or a microphone.
- No hosted real ATC recordings. Link out to LiveATC for listening practice.

### 5.7 Weather
- METAR and TAF decoding drills with hover explanations per field.
- Later: fronts, stability, thunderstorm life cycle, and icing visuals.

### 5.8 Instruments and systems
- Pitot-static system with failure modes (blocked pitot, blocked static) and resulting gauge behavior.
- Gyroscopic instruments; four-stroke engine cycle; electrical and fuel systems.

### 5.9 Navigation
- Wind triangle and E6B-style calculations.
- Cross-country leg planner.

### 5.10 Regulations
- Mostly spaced-repetition review, since regs suit drilling more than simulation.

## 6. Architecture and stack

- **Framework:** Vite, React, TypeScript (strict).
- **Styling:** Tailwind CSS with accessible headless primitives (for example, Radix). Clean, modern, app-like; light and dark mode.
- **Lessons:** MDX, so lesson text reads like markdown with sim components embedded.
- **Sims:** SVG, with D3 where helpful. Canvas only when performance requires it.
- **Routing:** client-side router configured for static hosting (hash routing or a 404 fallback on GitHub Pages).
- **PWA:** installable and usable offline.
- **Speech:** Web Speech API for text-to-speech; MediaRecorder for self-check; speech recognition added in Phase 4.
- **Testing:** Vitest for unit tests (all math and physics); Playwright for end-to-end flows.
- **Hosting:** GitHub Pages via GitHub Actions on push to main. Keep the build portable so moving to Cloudflare Pages or Vercel later is trivial.
- **Progress storage:** behind a `ProgressStore` interface. Local implementation now (localStorage plus export and import to a file). A synced, account-backed implementation later for premium.
- **Future backend (premium only, not in MVP):** auth, payments, and progress sync. Candidate options to evaluate later: Supabase, or Cloudflare Workers with a small database, plus Stripe.

## 7. Data models (draft)

These are starting sketches to refine in Phase 0.

```ts
// ---------- Aircraft ----------
interface Aircraft {
  id: string;                 // "c172s"
  model: string;              // "Cessna 172S Skyhawk SP"
  sourceNote: string;         // which POH revision the numbers came from
  emptyWeightLb: number;
  emptyArmIn: number;
  maxGrossLb: { normal: number; utility?: number };
  stations: Station[];
  fuel: { usableGal: number; armIn: number; lbPerGal: number };
  envelope: { normal: Point[]; utility?: Point[] }; // [armIn, weightLb] polygon
  vSpeeds: Record<string, number>;                   // knots
  performance: { takeoff?: PerfTable; climb?: PerfTable; landing?: PerfTable };
}
interface Station { id: string; name: string; armIn: number; maxLb?: number }
type Point = [number, number];
interface PerfTable { axes: string[]; values: number[][]; notes?: string[] }

// ---------- Airport (graph) ----------
interface Airport {
  id: string;                 // "KCHA" or "TEACH1" for the fictional field
  name: string;
  elevationFt: number;
  towered: boolean;
  airspaceClass: "B" | "C" | "D" | "E" | "G";
  frequencies: Frequency[];
  nodes: AirportNode[];
  edges: AirportEdge[];
  runways: Runway[];
  signs: Sign[];
  hotspots: Hotspot[];
  localRules?: string[];      // from the Chart Supplement
}
interface AirportNode {
  id: string; x: number; y: number;
  kind: "intersection" | "holdShort" | "runwayEntry" | "parking" | "runup" | "fbo";
  holdShortFor?: string;      // runway id
}
interface AirportEdge {
  id: string; from: string; to: string;
  kind: "taxiway" | "runway";
  taxiway?: string;           // "A", "C"
  runwayId?: string;          // crossing or traveling a runway requires clearance
}
interface Runway {
  id: string;                 // "02/20"
  ends: { designator: string; thresholdNode: string; headingMag: number; displacedFt?: number }[];
  lengthFt: number; widthFt: number;
}
interface Sign {
  id: string; nodeId: string; facingDeg: number;
  kind: "mandatory" | "location" | "direction" | "destination" | "information" | "distanceRemaining";
  text: string;
}
interface Hotspot { id: string; nodeIds: string[]; description: string }
interface Frequency { kind: "ATIS" | "CLR" | "GND" | "TWR" | "APP" | "DEP" | "CTAF" | "UNICOM"; mhz: string }

// ---------- ATC scenario (state machine) ----------
interface Scenario {
  id: string; title: string; airportId: string;
  aircraft: { callsign: string; type: string };
  premium?: boolean;
  startStepId: string;
  steps: Record<string, ScenarioStep>;
}
interface ScenarioStep {
  id: string;
  frequency: Frequency["kind"];
  atc?: string;               // controller transmission (spoken via TTS)
  pilot?: {
    prompt: string;           // what the student should do
    required: ReadbackItem[]; // graded items
    example: string;          // model readback
  };
  position?: string;          // airport node id
  next: { pass: string; fail?: string };
}
interface ReadbackItem {
  kind: "callsign" | "runway" | "holdShort" | "route" | "altitude" | "heading" | "squawk" | "frequency" | "altimeter";
  value: string;
}

// ---------- Question ----------
interface Question {
  id: string;
  acs: string[];              // ACS task codes
  type: "multipleChoice" | "simTask" | "typed";
  prompt: string;
  choices?: string[];
  answer: string | number | SimTarget;
  explanation: string;
  sources: { doc: string; ref: string }[];
  difficulty: 1 | 2 | 3;
  premium?: boolean;
}
interface SimTarget { sim: string; condition: string } // e.g. CG within aft 1 inch of limit

// ---------- Progress ----------
interface ProgressStore {
  getLessonState(id: string): Promise<LessonState | null>;
  saveLessonState(id: string, s: LessonState): Promise<void>;
  getReviewQueue(): Promise<ReviewItem[]>;
  recordAnswer(questionId: string, correct: boolean): Promise<void>;
  exportAll(): Promise<Blob>;
  importAll(file: Blob): Promise<void>;
}
```

## 8. Business model and licensing

- **Model (proposed): freemium.**
  - Free: all core lessons and sims, basic quizzes, the fictional teaching airport, basic ATC scenarios.
  - Premium (candidates): full ATC scenario packs, real-airport packs, full-length practice exams, cross-device progress sync.
- **Licensing (proposed):**
  - Code: MIT.
  - Lesson content (text, questions, scenarios): CC BY-NC-SA 4.0.
  - Contributors sign a Contributor License Agreement (for example, via the CLA Assistant GitHub app) granting the project the right to use contributions commercially.
  - Get a one-time legal consult on licenses and the CLA before charging money.
- **Possible later path:** partner with a CFI to offer a knowledge test endorsement, which would make it a complete course.

## 9. Disclaimer (persistent, every page)

> For educational purposes only. Not an FAA-approved course and not a substitute for instruction from a certificated flight instructor. Never use this site for real flight planning; always use your aircraft's official documents and current FAA publications.

Also add a first-visit notice, the disclaimer in the README, and a short line on every sim stating its simplifications.

## 10. Privacy and analytics

- Cookieless, privacy-respecting analytics (candidates: Plausible, or self-hosted Umami).
- Track only anonymous aggregates: page views, lesson starts and completions, where people drop off.
- No personal data collected in the MVP. A plain-language privacy page from day one.

## 11. Accessibility

- Every color-coded element gets a second cue (label, pattern, or shape): airspace classes, red/white mandatory signs, light gun signals, CG in and out of limits.
- Every sim control is keyboard operable with visible focus and screen-reader labels.
- Respect reduced-motion settings in animations.
- Target WCAG 2.2 AA.

## 12. Repo structure (proposed)

```
/
├─ PLAN.md
├─ README.md
├─ LICENSE (MIT, code)
├─ CONTENT_LICENSE.md (CC BY-NC-SA 4.0)
├─ CONTRIBUTING.md
├─ docs/
│  ├─ content-style-guide.md
│  └─ accuracy-review.md
├─ src/
│  ├─ app/            # shell, routing, layout, theming
│  ├─ components/     # shared UI
│  ├─ sims/           # one folder per sim (wb, aero, airspace, taxi, atc...)
│  ├─ engines/        # pure logic: wb math, perf interpolation, airport graph, scenario engine, readback grader, SRS
│  ├─ progress/       # ProgressStore implementations
│  └─ content/        # MDX lessons
├─ data/
│  ├─ aircraft/       # c172s.json
│  ├─ airports/       # teach1.json, kcha.json
│  ├─ scenarios/
│  └─ questions/
└─ tests/
   ├─ unit/
   └─ e2e/
```

Engines are pure TypeScript with no React, so they're easy to test and reuse.

## 13. Phases

### Phase 0: Foundation
- Scaffold (Vite, React, TS strict, Tailwind, MDX, Vitest, Playwright, lint and format).
- GitHub Actions: test and deploy to GitHub Pages.
- App shell, theming (light and dark), lesson layout template, disclaimer, privacy page.
- JSON schemas plus validation for all four data models.
- `ProgressStore` local implementation with export and import.
- PWA setup.
- **Done when:** a placeholder lesson with a trivial sim and one question deploys, works offline, and passes CI.

### Phase 1: MVP core
- Weight and balance (C172S), aerodynamics explorer, airspace trainer, each with questions.
- **Done when:** all three are usable on phone and desktop, math is tested against worked examples, and each has at least 10 questions mapped to ACS codes.

### Phase 2: On the ground
- Fictional teaching airport, signs and markings trainer, taxi route tracer, lighting, traffic pattern.
- Density altitude and performance.
- **Done when:** taxi tracer correctly flags unauthorized runway crossings in tests.

### Phase 3: On the radio
- Phraseology basics, scenario engine, readback grader, typed mode, speak-and-self-check mode, CTAF mode, light gun signals.
- **Done when:** a full scripted flight at the teaching airport can be completed end to end.

### Phase 4: Breadth and premium groundwork
- Graded voice input, weather, instruments and systems, navigation, regulations.
- Spaced-repetition review queue, ACS coverage dashboard.
- Real airports (KCHA plus a non-towered field).
- CFI review, then public launch.
- Evaluate backend options for accounts, payments, and sync.

## 14. Contribution model

- Contributions welcome after Phase 1, once the content style guide and templates exist.
- CLA required (see section 8).
- Content PRs need sources cited, ACS codes assigned, and accuracy review before merge.
- Issue templates: content error, new question, new scenario, bug.

## 15. Open decisions

- [ ] Project name and domain
- [ ] Confirm freemium split (what's free vs premium)
- [ ] Analytics provider (Plausible vs Umami)
- [ ] Which nearby non-towered field to model alongside KCHA
- [ ] Flight school and CFI reviewer
- [ ] Legal consult on license and CLA before monetizing

## 16. Notes for development in Claude Code

- Start with Phase 0 exactly as listed; don't build modules before the schemas and lesson template exist.
- Keep engines pure and fully tested; sims are thin UI over engines.
- Never invent aircraft numbers. Leave POH values as clearly marked placeholders until filled from a real 172S POH.
- Every new lesson follows the lesson template and includes sources and ACS codes.
