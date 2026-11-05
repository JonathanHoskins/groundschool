import { z } from 'zod'

// ---------- Shared ----------

export const PointSchema = z.tuple([z.number(), z.number()])

export const PerfTableSchema = z.object({
  axes: z.array(z.string()),
  values: z.array(z.array(z.number())),
  notes: z.array(z.string()).optional(),
})

// ---------- Aircraft ----------

export const StationSchema = z.object({
  id: z.string(),
  name: z.string(),
  armIn: z.number(),
  maxLb: z.number().optional(),
})

export const AircraftSchema = z.object({
  id: z.string(),
  model: z.string(),
  sourceNote: z.string(),
  emptyWeightLb: z.number(),
  emptyArmIn: z.number(),
  maxGrossLb: z.object({
    normal: z.number(),
    utility: z.number().optional(),
  }),
  stations: z.array(StationSchema),
  fuel: z.object({
    usableGal: z.number(),
    armIn: z.number(),
    lbPerGal: z.number(),
  }),
  envelope: z.object({
    normal: z.array(PointSchema),
    utility: z.array(PointSchema).optional(),
  }),
  vSpeeds: z.record(z.string(), z.number()),
  performance: z.object({
    takeoff: PerfTableSchema.optional(),
    climb: PerfTableSchema.optional(),
    landing: PerfTableSchema.optional(),
  }),
})

export type Aircraft = z.infer<typeof AircraftSchema>
export type Station = z.infer<typeof StationSchema>
export type PerfTable = z.infer<typeof PerfTableSchema>
export type Point = z.infer<typeof PointSchema>

// ---------- Airport ----------

export const FrequencySchema = z.object({
  kind: z.enum(['ATIS', 'CLR', 'GND', 'TWR', 'APP', 'DEP', 'CTAF', 'UNICOM']),
  mhz: z.string(),
})

export const AirportNodeSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  kind: z.enum(['intersection', 'holdShort', 'runwayEntry', 'parking', 'runup', 'fbo']),
  holdShortFor: z.string().optional(),
})

export const AirportEdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  kind: z.enum(['taxiway', 'runway']),
  taxiway: z.string().optional(),
  runwayId: z.string().optional(),
})

export const RunwaySchema = z.object({
  id: z.string(),
  ends: z.array(
    z.object({
      designator: z.string(),
      thresholdNode: z.string(),
      headingMag: z.number(),
      displacedFt: z.number().optional(),
    }),
  ),
  lengthFt: z.number(),
  widthFt: z.number(),
})

export const SignSchema = z.object({
  id: z.string(),
  nodeId: z.string(),
  facingDeg: z.number(),
  kind: z.enum([
    'mandatory',
    'location',
    'direction',
    'destination',
    'information',
    'distanceRemaining',
  ]),
  text: z.string(),
})

export const HotspotSchema = z.object({
  id: z.string(),
  nodeIds: z.array(z.string()),
  description: z.string(),
})

export const AirportSchema = z.object({
  id: z.string(),
  name: z.string(),
  elevationFt: z.number(),
  towered: z.boolean(),
  airspaceClass: z.enum(['B', 'C', 'D', 'E', 'G']),
  frequencies: z.array(FrequencySchema),
  nodes: z.array(AirportNodeSchema),
  edges: z.array(AirportEdgeSchema),
  runways: z.array(RunwaySchema),
  signs: z.array(SignSchema),
  hotspots: z.array(HotspotSchema),
  localRules: z.array(z.string()).optional(),
})

export type Airport = z.infer<typeof AirportSchema>
export type Frequency = z.infer<typeof FrequencySchema>
export type AirportNode = z.infer<typeof AirportNodeSchema>
export type AirportEdge = z.infer<typeof AirportEdgeSchema>
export type Runway = z.infer<typeof RunwaySchema>
export type Sign = z.infer<typeof SignSchema>
export type Hotspot = z.infer<typeof HotspotSchema>

// ---------- ATC Scenario ----------

export const ReadbackItemSchema = z.object({
  kind: z.enum([
    'callsign',
    'runway',
    'holdShort',
    'route',
    'altitude',
    'heading',
    'squawk',
    'frequency',
    'altimeter',
  ]),
  value: z.string(),
})

export const ScenarioStepSchema = z.object({
  id: z.string(),
  frequency: FrequencySchema.shape.kind,
  atc: z.string().optional(),
  pilot: z
    .object({
      prompt: z.string(),
      required: z.array(ReadbackItemSchema),
      example: z.string(),
    })
    .optional(),
  position: z.string().optional(),
  next: z.object({
    pass: z.string(),
    fail: z.string().optional(),
  }),
})

export const ScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  airportId: z.string(),
  aircraft: z.object({ callsign: z.string(), type: z.string() }),
  premium: z.boolean().optional(),
  startStepId: z.string(),
  steps: z.record(z.string(), ScenarioStepSchema),
})

export type Scenario = z.infer<typeof ScenarioSchema>
export type ScenarioStep = z.infer<typeof ScenarioStepSchema>
export type ReadbackItem = z.infer<typeof ReadbackItemSchema>

// ---------- Question ----------

export const SimTargetSchema = z.object({
  sim: z.string(),
  condition: z.string(),
})

export const QuestionSchema = z.object({
  id: z.string(),
  acs: z.array(z.string()),
  type: z.enum(['multipleChoice', 'simTask', 'typed']),
  prompt: z.string(),
  choices: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.number(), SimTargetSchema]),
  explanation: z.string(),
  sources: z.array(z.object({ doc: z.string(), ref: z.string() })),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  premium: z.boolean().optional(),
})

export type Question = z.infer<typeof QuestionSchema>
export type SimTarget = z.infer<typeof SimTargetSchema>
