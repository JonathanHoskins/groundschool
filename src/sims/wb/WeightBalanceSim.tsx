import { useState } from 'react'
import { AircraftSchema } from '../../engines/schemas'
import { calcWB } from '../../engines/wb'
import { EnvelopeChart } from './EnvelopeChart'
import c172sData from '../../../data/aircraft/c172s.json'

const aircraft = AircraftSchema.parse(c172sData)

interface SliderRowProps {
  id: string
  label: string
  min: number
  max: number
  step?: number
  value: number
  unit: string
  onChange: (v: number) => void
  extraLabel?: string
  overLimitMsg?: string
}

function SliderRow({ id, label, min, max, step = 1, value, unit, onChange, extraLabel, overLimitMsg }: SliderRowProps) {
  return (
    <div className="mb-3">
      <div className="mb-0.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span className="tabular-nums text-sm text-slate-900 dark:text-slate-100">
          {value} {unit}
          {extraLabel && <span className="ml-1 text-slate-500 dark:text-slate-400">({extraLabel})</span>}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-600"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unit}`}
      />
      {overLimitMsg && (
        <p role="alert" className="mt-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          {overLimitMsg}
        </p>
      )}
    </div>
  )
}

export function WeightBalanceSim() {
  const [frontPaxLb, setFrontPaxLb] = useState(170)
  const [rearPaxLb, setRearPaxLb] = useState(0)
  const [baggageALb, setBaggageALb] = useState(0)
  const [baggageBLb, setBaggageBLb] = useState(0)
  const [fuelGal, setFuelGal] = useState(30)

  const fuelWeightLb = fuelGal * 6.0

  const stations = [
    { id: 'frontSeats', name: 'Front seats', armIn: 37.0,  weightLb: frontPaxLb },
    { id: 'rearSeats',  name: 'Rear seats',  armIn: 73.0,  weightLb: rearPaxLb },
    { id: 'baggageA',   name: 'Baggage A',   armIn: 95.0,  weightLb: baggageALb },
    { id: 'baggageB',   name: 'Baggage B',   armIn: 123.0, weightLb: baggageBLb },
    { id: 'fuel',       name: 'Fuel',        armIn: 48.0,  weightLb: fuelWeightLb },
  ]

  const result = calcWB(
    aircraft.emptyWeightLb,
    aircraft.emptyArmIn,
    stations,
    aircraft.envelope.normal as [number, number][],
    aircraft.envelope.utility as [number, number][] | undefined,
  )

  const isInside = result.withinNormal
  const maxGross = aircraft.maxGrossLb.normal
  const overweight = result.totalWeightLb > maxGross

  const statusClasses = isInside
    ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 dark:border-green-700'
    : 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700'

  return (
    <figure
      aria-label="Weight and balance simulator for Cessna 172S"
      className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Simplification: PLACEHOLDER values for a C172S. Verify against your aircraft&apos;s current POH. Not for real flight planning.
      </p>

      {/* Status badge — always at top, full width */}
      <div
        className={`mb-4 rounded-lg border p-3 ${statusClasses}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-0.5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">Gross weight </span>
            <span className="text-xl font-bold tabular-nums">{result.totalWeightLb.toLocaleString()} lb</span>
            <span className="ml-1 text-xs opacity-60">/ {maxGross.toLocaleString()} max</span>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">CG </span>
            <span className="text-xl font-bold tabular-nums">{result.cgIn.toFixed(1)} in</span>
          </div>
          <span className="text-sm font-bold">
            {isInside ? '✓ Within normal envelope' : '✗ Outside envelope'}
          </span>
        </div>
        {result.withinUtility && (
          <p className="mt-1 text-xs font-medium">Also within utility category</p>
        )}
        {overweight && (
          <p role="alert" className="mt-1 text-sm font-bold">
            ✗ Over max gross by {(result.totalWeightLb - maxGross).toLocaleString()} lb
          </p>
        )}
      </div>

      {/* Two columns on md+: sliders left, chart right.
          Single column on mobile: sliders first (DOM order), chart second. */}
      <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-6">

        {/* Col 1 — sliders (appears first on mobile) */}
        <div>
          <SliderRow
            id="wb-front-pax"
            label="Front seats"
            min={0} max={400} value={frontPaxLb} unit="lb"
            onChange={setFrontPaxLb}
          />
          <SliderRow
            id="wb-rear-pax"
            label="Rear seats"
            min={0} max={400} value={rearPaxLb} unit="lb"
            onChange={setRearPaxLb}
          />
          <SliderRow
            id="wb-baggage-a"
            label="Baggage A (max 120 lb)"
            min={0} max={120} value={baggageALb} unit="lb"
            onChange={setBaggageALb}
            overLimitMsg={baggageALb > 120 ? 'Exceeds compartment limit' : undefined}
          />
          <SliderRow
            id="wb-baggage-b"
            label="Baggage B (max 50 lb)"
            min={0} max={50} value={baggageBLb} unit="lb"
            onChange={setBaggageBLb}
            overLimitMsg={baggageBLb > 50 ? 'Exceeds compartment limit' : undefined}
          />
          <SliderRow
            id="wb-fuel"
            label="Fuel"
            min={0} max={53} value={fuelGal} unit="gal"
            onChange={setFuelGal}
            extraLabel={`${fuelWeightLb.toLocaleString()} lb`}
          />
        </div>

        {/* Col 2 — envelope chart (appears second on mobile) */}
        <div>
          <EnvelopeChart
            normalEnvelope={aircraft.envelope.normal as [number, number][]}
            utilityEnvelope={aircraft.envelope.utility as [number, number][] | undefined}
            currentPoint={[result.cgIn, result.totalWeightLb]}
            isInside={isInside}
          />
        </div>
      </div>
    </figure>
  )
}
