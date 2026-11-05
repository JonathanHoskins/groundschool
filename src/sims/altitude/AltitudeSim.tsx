import { useState } from 'react'
import { altitudeToInHg } from '../../engines/atmosphere'

const MIN_ALT = 0
const MAX_ALT = 18000

export function AltitudeSim() {
  const [altFt, setAltFt] = useState(0)
  const pressureInHg = altitudeToInHg(altFt)
  const seaLevelInHg = altitudeToInHg(0)
  const fraction = pressureInHg / seaLevelInHg

  return (
    <figure
      aria-label="Altitude vs pressure altitude simulator"
      className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="mb-1 text-xs text-slate-400 dark:text-slate-500">
        Simplification: standard atmosphere (ISA), no temperature correction.
      </p>

      <div className="mb-4 flex items-end gap-6">
        <div>
          <label
            htmlFor="alt-slider"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Altitude
          </label>
          <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {altFt.toLocaleString()} ft
          </span>
        </div>
        <div>
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Pressure
          </span>
          <span className="text-2xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
            {pressureInHg.toFixed(2)} inHg
          </span>
        </div>
      </div>

      <input
        id="alt-slider"
        type="range"
        min={MIN_ALT}
        max={MAX_ALT}
        step={100}
        value={altFt}
        onChange={(e) => setAltFt(Number(e.target.value))}
        className="w-full accent-sky-600"
        aria-valuemin={MIN_ALT}
        aria-valuemax={MAX_ALT}
        aria-valuenow={altFt}
        aria-valuetext={`${altFt.toLocaleString()} feet, ${pressureInHg.toFixed(2)} inHg`}
      />

      {/* Visual pressure bar */}
      <div
        role="presentation"
        className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
      >
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-150"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>0 ft (sea level)</span>
        <span>18,000 ft</span>
      </div>
    </figure>
  )
}
