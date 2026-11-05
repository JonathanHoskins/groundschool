interface EnvelopeChartProps {
  normalEnvelope: [number, number][]
  utilityEnvelope?: [number, number][]
  currentPoint: [number, number] // [cgIn, weightLb]
  isInside: boolean
}

// Chart layout constants
const SVG_WIDTH = 500
const SVG_HEIGHT = 380
const PAD_LEFT = 55
const PAD_RIGHT = 20
const PAD_TOP = 20
const PAD_BOTTOM = 50

const CHART_W = SVG_WIDTH - PAD_LEFT - PAD_RIGHT   // 425
const CHART_H = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM  // 310

// Axis domains
const X_MIN = 33
const X_MAX = 52
const Y_MIN = 1400
const Y_MAX = 2700

function xScale(armIn: number): number {
  return PAD_LEFT + ((armIn - X_MIN) / (X_MAX - X_MIN)) * CHART_W
}

function yScale(weightLb: number): number {
  // SVG y-axis is flipped (0 at top); heavier weight → lower SVG y
  return PAD_TOP + ((Y_MAX - weightLb) / (Y_MAX - Y_MIN)) * CHART_H
}

function envelopeToPoints(envelope: [number, number][]): string {
  return envelope.map(([arm, wt]) => `${xScale(arm)},${yScale(wt)}`).join(' ')
}

export function EnvelopeChart({
  normalEnvelope,
  utilityEnvelope,
  currentPoint,
  isInside,
}: EnvelopeChartProps) {
  const [cgIn, weightLb] = currentPoint

  const cx = xScale(cgIn)
  const cy = yScale(weightLb)

  const statusText = isInside ? 'within' : 'outside'
  const ariaLabel = `Weight and balance envelope chart. Current state: ${weightLb.toFixed(0)} lb gross weight, CG at ${cgIn.toFixed(1)} inches from datum — ${statusText} the normal envelope.`

  // X-axis tick marks every 2 in
  const xTicks: number[] = []
  for (let v = X_MIN; v <= X_MAX; v += 2) xTicks.push(v)

  // Y-axis tick marks every 200 lb
  const yTicks: number[] = []
  for (let v = Y_MIN; v <= Y_MAX; v += 200) yTicks.push(v)

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      width="100%"
      height="auto"
      role="img"
      aria-label={ariaLabel}
      className="block"
    >
      {/* Chart background */}
      <rect
        x={PAD_LEFT}
        y={PAD_TOP}
        width={CHART_W}
        height={CHART_H}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={1}
      />

      {/* Normal envelope fill */}
      <polygon
        points={envelopeToPoints(normalEnvelope)}
        fill="#bfdbfe"
        fillOpacity={0.4}
        stroke="#3b82f6"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Utility envelope fill (drawn on top of normal) */}
      {utilityEnvelope && (
        <polygon
          points={envelopeToPoints(utilityEnvelope)}
          fill="#e9d5ff"
          fillOpacity={0.5}
          stroke="#9333ea"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}

      {/* Crosshairs at current point */}
      <line
        x1={PAD_LEFT}
        y1={cy}
        x2={PAD_LEFT + CHART_W}
        y2={cy}
        stroke="#64748b"
        strokeWidth={1}
        strokeDasharray="4 3"
        strokeOpacity={0.4}
      />
      <line
        x1={cx}
        y1={PAD_TOP}
        x2={cx}
        y2={PAD_TOP + CHART_H}
        stroke="#64748b"
        strokeWidth={1}
        strokeDasharray="4 3"
        strokeOpacity={0.4}
      />

      {/* CG point */}
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill={isInside ? '#16a34a' : '#dc2626'}
        stroke="white"
        strokeWidth={1.5}
      />

      {/* X-axis ticks and labels */}
      {xTicks.map((v) => (
        <g key={`x-${v}`}>
          <line
            x1={xScale(v)}
            y1={PAD_TOP + CHART_H}
            x2={xScale(v)}
            y2={PAD_TOP + CHART_H + 5}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          <text
            x={xScale(v)}
            y={PAD_TOP + CHART_H + 18}
            textAnchor="middle"
            fontSize={11}
            fill="#64748b"
          >
            {v}
          </text>
        </g>
      ))}

      {/* X-axis label */}
      <text
        x={PAD_LEFT + CHART_W / 2}
        y={SVG_HEIGHT - 4}
        textAnchor="middle"
        fontSize={12}
        fill="#475569"
        fontWeight="500"
      >
        CG (in from datum)
      </text>

      {/* Y-axis ticks and labels */}
      {yTicks.map((v) => (
        <g key={`y-${v}`}>
          <line
            x1={PAD_LEFT - 5}
            y1={yScale(v)}
            x2={PAD_LEFT}
            y2={yScale(v)}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          <text
            x={PAD_LEFT - 8}
            y={yScale(v) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#64748b"
          >
            {v.toLocaleString()}
          </text>
        </g>
      ))}

      {/* Y-axis label (rotated) */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fontSize={12}
        fill="#475569"
        fontWeight="500"
        transform={`translate(13, ${PAD_TOP + CHART_H / 2}) rotate(-90)`}
      >
        Gross Weight (lb)
      </text>

      {/* Envelope legend labels */}
      <text
        x={PAD_LEFT + 6}
        y={PAD_TOP + 16}
        fontSize={10}
        fill="#3b82f6"
        fontWeight="500"
      >
        Normal
      </text>
      {utilityEnvelope && (
        <text
          x={PAD_LEFT + 6}
          y={PAD_TOP + 28}
          fontSize={10}
          fill="#9333ea"
          fontWeight="500"
        >
          Utility
        </text>
      )}
    </svg>
  )
}
