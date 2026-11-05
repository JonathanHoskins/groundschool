import { useState } from 'react'
import { calcAero } from '../../engines/aero'

// C172S approximate 1-g stall speed — PLACEHOLDER, verify against POH
const VS1G_KT = 48
// C172S approximate max gross weight — PLACEHOLDER, verify against POH
const C172S_MAX_GROSS_LB = 2550
// Max lift arrow length in px for SVG diagram
const SVG_LIFT_MAX_PX = 120
// Scale reference: at ~3000 lb lift the arrow is at max length
const SVG_LIFT_SCALE_LB = 3000

export function AerodynamicsExplorer() {
  const [aoaDeg, setAoaDeg] = useState(5)
  const [airspeedKt, setAirspeedKt] = useState(100)
  const [bankDeg, setBankDeg] = useState(0)

  const result = calcAero(aoaDeg, airspeedKt, bankDeg, VS1G_KT)
  const { cl, cd, liftLb, dragLb, loadFactor, turnStallSpeedKt, isStalled } = result

  // Bank / stall callout styling
  let calloutClass =
    'rounded-lg border p-4 text-sm '
  if (loadFactor > 2.0) {
    calloutClass += 'border-red-400 bg-red-50 text-red-900 dark:border-red-600 dark:bg-red-950/40 dark:text-red-200'
  } else if (loadFactor > 1.5) {
    calloutClass += 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200'
  } else {
    calloutClass += 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }

  const calloutBold = loadFactor > 1.5

  // SVG four-forces diagram values
  const svgCx = 150
  const svgCy = 150

  const liftPx = Math.max(10, Math.min(SVG_LIFT_MAX_PX, (liftLb / SVG_LIFT_SCALE_LB) * SVG_LIFT_MAX_PX))
  const weightPx = 60
  const thrustPx = 50
  const dragPx = Math.max(10, Math.min(SVG_LIFT_MAX_PX, (dragLb / SVG_LIFT_SCALE_LB) * SVG_LIFT_MAX_PX))

  const liftArrowColor = liftLb >= C172S_MAX_GROSS_LB ? '#16a34a' : '#2563eb' // green-600 / blue-600
  const liftArrowLabel = liftLb >= C172S_MAX_GROSS_LB ? '#15803d' : '#1d4ed8'

  return (
    <figure
      aria-label="Aerodynamics explorer simulator"
      className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      {/* Simplification note */}
      <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
        Simplification: sea-level standard atmosphere, linear lift model up to critical AoA,
        parabolic drag polar. All aircraft constants are PLACEHOLDER values.
      </p>

      {/* Live readout strip — stays near the top while interacting with sliders */}
      <div
        className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Live aerodynamics readout"
      >
        {[
          { label: 'CL', value: cl.toFixed(2), unit: '', highlight: isStalled },
          { label: 'Lift', value: Math.round(liftLb).toLocaleString(), unit: 'lb', highlight: false },
          { label: 'Load factor', value: loadFactor.toFixed(2), unit: 'g', highlight: loadFactor > 1.5 },
          { label: 'Stall speed', value: turnStallSpeedKt.toFixed(0), unit: 'kt', highlight: loadFactor > 1.5 },
        ].map(({ label, value, unit, highlight }) => (
          <div
            key={label}
            className={`rounded-lg border px-3 py-2 ${
              highlight
                ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {value}<span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Section 1: Controls */}
      <div className="mb-6 space-y-4">
        {/* Angle of Attack */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="aoa-slider"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Angle of Attack
            </label>
            <span className="flex items-center gap-2 text-sm tabular-nums">
              <span className="font-bold text-slate-900 dark:text-slate-100">{aoaDeg}°</span>
              {isStalled && (
                <span
                  className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  STALLED
                </span>
              )}
            </span>
          </div>
          <input
            id="aoa-slider"
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={aoaDeg}
            onChange={(e) => setAoaDeg(Number(e.target.value))}
            className="w-full accent-sky-600"
            aria-label={`Angle of attack: ${aoaDeg} degrees${isStalled ? ', stalled' : ''}`}
            aria-valuemin={0}
            aria-valuemax={20}
            aria-valuenow={aoaDeg}
            aria-valuetext={`${aoaDeg} degrees${isStalled ? ', wing is stalled' : ''}`}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0°</span>
            <span>20°</span>
          </div>
        </div>

        {/* Airspeed */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="airspeed-slider"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Airspeed
            </label>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {airspeedKt} kt
            </span>
          </div>
          <input
            id="airspeed-slider"
            type="range"
            min={40}
            max={180}
            step={1}
            value={airspeedKt}
            onChange={(e) => setAirspeedKt(Number(e.target.value))}
            className="w-full accent-sky-600"
            aria-label={`Airspeed: ${airspeedKt} knots`}
            aria-valuemin={40}
            aria-valuemax={180}
            aria-valuenow={airspeedKt}
            aria-valuetext={`${airspeedKt} knots`}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>40 kt</span>
            <span>180 kt</span>
          </div>
        </div>

        {/* Bank Angle */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="bank-slider"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Bank Angle
            </label>
            <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {bankDeg}°
            </span>
          </div>
          <input
            id="bank-slider"
            type="range"
            min={0}
            max={80}
            step={1}
            value={bankDeg}
            onChange={(e) => setBankDeg(Number(e.target.value))}
            className="w-full accent-sky-600"
            aria-label={`Bank angle: ${bankDeg} degrees`}
            aria-valuemin={0}
            aria-valuemax={80}
            aria-valuenow={bankDeg}
            aria-valuetext={`${bankDeg} degrees of bank`}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0° (level)</span>
            <span>80°</span>
          </div>
        </div>
      </div>

      {/* Stall live region (screen-reader announcement) */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isStalled ? 'Warning: wing is stalled. Angle of attack exceeds critical AoA.' : ''}
      </div>

      {/* Drag and CD detail — supplementary, below sliders */}
      <div className="mb-6 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>Drag: <strong className="text-slate-900 dark:text-slate-100">{Math.round(dragLb).toLocaleString()} lb</strong></span>
        <span>CD: <strong className="text-slate-900 dark:text-slate-100">{cd.toFixed(3)}</strong></span>
      </div>

      {/* Section 3: Bank angle & stall speed callout */}
      <div className={`${calloutClass} mb-6`}>
        {bankDeg === 0 ? (
          <p className={calloutBold ? 'font-bold' : ''}>
            In level flight, stall speed is {VS1G_KT} kt.
          </p>
        ) : (
          <>
            <p className={calloutBold ? 'font-bold' : ''}>
              In a {bankDeg}° bank, load factor is {loadFactor.toFixed(2)} g.
            </p>
            <p className={`mt-1 ${calloutBold ? 'font-bold' : ''}`}>
              Stall speed increases from {VS1G_KT} kt to {turnStallSpeedKt.toFixed(0)} kt.
            </p>
          </>
        )}
      </div>

      {/* Section 4: SVG four-forces diagram */}
      <div className="flex justify-center">
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          aria-label="Four forces diagram showing lift, weight, thrust, and drag"
          role="img"
          className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
        >
          <defs>
            <marker id="arrow-up" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,8 L4,0 L8,8" fill={liftArrowColor} />
            </marker>
            <marker id="arrow-down" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L4,8 L8,0" fill="#dc2626" />
            </marker>
            <marker id="arrow-right" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="#7c3aed" />
            </marker>
            <marker id="arrow-left" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M8,0 L0,4 L8,8" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Aircraft silhouette: simple wing/body shape */}
          {/* Fuselage */}
          <ellipse cx={svgCx} cy={svgCy} rx={28} ry={10} fill="#94a3b8" />
          {/* Wings */}
          <polygon
            points={`${svgCx - 10},${svgCy} ${svgCx - 70},${svgCy + 8} ${svgCx - 70},${svgCy + 2} ${svgCx - 10},${svgCy - 4}`}
            fill="#64748b"
          />
          <polygon
            points={`${svgCx + 10},${svgCy} ${svgCx + 70},${svgCy + 8} ${svgCx + 70},${svgCy + 2} ${svgCx + 10},${svgCy - 4}`}
            fill="#64748b"
          />
          {/* Tail */}
          <polygon
            points={`${svgCx - 28},${svgCy - 4} ${svgCx - 42},${svgCy - 22} ${svgCx - 36},${svgCy - 4}`}
            fill="#64748b"
          />

          {/* Lift arrow — upward */}
          <line
            x1={svgCx}
            y1={svgCy - 14}
            x2={svgCx}
            y2={svgCy - 14 - liftPx}
            stroke={liftArrowColor}
            strokeWidth="3"
            markerEnd="url(#arrow-up)"
          />
          <text
            x={svgCx + 6}
            y={svgCy - 14 - liftPx / 2}
            fontSize="11"
            fill={liftArrowLabel}
            fontWeight="600"
          >
            Lift
          </text>

          {/* Weight arrow — downward */}
          <line
            x1={svgCx}
            y1={svgCy + 14}
            x2={svgCx}
            y2={svgCy + 14 + weightPx}
            stroke="#dc2626"
            strokeWidth="3"
            markerEnd="url(#arrow-down)"
          />
          <text
            x={svgCx + 6}
            y={svgCy + 14 + weightPx / 2 + 4}
            fontSize="11"
            fill="#b91c1c"
            fontWeight="600"
          >
            Weight
          </text>

          {/* Thrust arrow — rightward */}
          <line
            x1={svgCx + 28}
            y1={svgCy}
            x2={svgCx + 28 + thrustPx}
            y2={svgCy}
            stroke="#7c3aed"
            strokeWidth="3"
            markerEnd="url(#arrow-right)"
          />
          <text
            x={svgCx + 32}
            y={svgCy - 6}
            fontSize="11"
            fill="#6d28d9"
            fontWeight="600"
          >
            Thrust
          </text>

          {/* Drag arrow — leftward */}
          <line
            x1={svgCx - 28}
            y1={svgCy}
            x2={svgCx - 28 - dragPx}
            y2={svgCy}
            stroke="#f59e0b"
            strokeWidth="3"
            markerEnd="url(#arrow-left)"
          />
          <text
            x={svgCx - 28 - dragPx - 28}
            y={svgCy - 6}
            fontSize="11"
            fill="#d97706"
            fontWeight="600"
          >
            Drag
          </text>

          {/* CD label */}
          <text x={8} y={292} fontSize="9" fill="#94a3b8">
            CD = {cd.toFixed(3)}
          </text>
        </svg>
      </div>
    </figure>
  )
}
