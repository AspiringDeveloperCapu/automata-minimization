import { useMemo } from 'react'
import type { DFA, StateId } from '../types/dfa'
import { layoutDfa } from '../lib/layout'
import type { LaidOutNode } from '../lib/layout'
import {
  HIGHLIGHT_STROKE,
  NEUTRAL_COLOR,
  type BlockColor,
} from '../lib/palette'

interface DiagramProps {
  dfa: DFA
  colorForState?: (state: StateId) => BlockColor
  badgeForState?: (state: StateId) => string | undefined
  highlightStates?: Set<StateId>
}

interface EdgeGroup {
  from: StateId
  to: StateId
  symbols: string[]
}

function anchor(point: { x: number; y: number }, toward: { x: number; y: number }, radius: number) {
  const dx = toward.x - point.x
  const dy = toward.y - point.y
  const dist = Math.hypot(dx, dy) || 1
  return { x: point.x + (dx / dist) * radius, y: point.y + (dy / dist) * radius }
}

function curvedPath(a: LaidOutNode, b: LaidOutNode, radius: number, curve: number) {
  const midX = (a.x + b.x) / 2
  const midY = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy) || 1
  const perpX = -dy / dist
  const perpY = dx / dist
  const control = { x: midX + perpX * curve, y: midY + perpY * curve }
  const start = anchor(a, control, radius + 2)
  const end = anchor(b, control, radius + 10)
  return {
    path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
    label: {
      x: (start.x + end.x + control.x) / 3,
      y: (start.y + end.y + control.y) / 3,
    },
  }
}

function selfLoopPath(node: LaidOutNode, radius: number) {
  const r = radius * 1.7
  const start = { x: node.x - radius * 0.6, y: node.y - radius * 0.75 }
  const end = { x: node.x + radius * 0.6, y: node.y - radius * 0.75 }
  return {
    path: `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`,
    label: { x: node.x, y: node.y - radius - 42 },
  }
}

export function Diagram({ dfa, colorForState, badgeForState, highlightStates }: DiagramProps) {
  const layout = useMemo(() => layoutDfa(dfa), [dfa])
  const { byState, radius } = layout

  const edges = useMemo(() => {
    const groups = new Map<string, EdgeGroup>()
    for (const from of dfa.states) {
      if (!byState[from]) continue
      for (const symbol of dfa.alphabet) {
        const to = dfa.transitions[from]?.[symbol]
        if (to === undefined || !byState[to]) continue
        const key = `${from}\u0000${to}`
        const existing = groups.get(key)
        if (existing) existing.symbols.push(symbol)
        else groups.set(key, { from, to, symbols: [symbol] })
      }
    }
    const hasReverse = new Set<string>()
    for (const g of groups.values()) hasReverse.add(`${g.to}\u0000${g.from}`)
    return [...groups.values()].map((g) => ({
      ...g,
      curve: g.from !== g.to && hasReverse.has(`${g.from}\u0000${g.to}`) ? 30 : 0,
    }))
  }, [dfa, byState])

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className="h-auto w-full"
      role="img"
      aria-label="State diagram"
    >
      <defs>
        <marker
          id="dfa-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
      </defs>

      {edges.map((edge) => {
        const a = byState[edge.from]
        const b = byState[edge.to]
        const geometry =
          edge.from === edge.to
            ? selfLoopPath(a, radius)
            : curvedPath(a, b, radius, edge.curve)
        return (
          <g key={`${edge.from}->${edge.to}`}>
            <path
              d={geometry.path}
              fill="none"
              stroke="#475569"
              strokeWidth={1.6}
              markerEnd="url(#dfa-arrow)"
            />
            <text
              x={geometry.label.x}
              y={geometry.label.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              className="mono"
              fill="#334155"
              stroke="#ffffff"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {edge.symbols.join(',')}
            </text>
          </g>
        )
      })}

      {layout.nodes.map((node) => {
        const color = colorForState?.(node.state) ?? NEUTRAL_COLOR
        const highlighted = highlightStates?.has(node.state) ?? false
        const stroke = highlighted ? HIGHLIGHT_STROKE : color.stroke
        const accepting = dfa.accepting.includes(node.state)
        const badge = badgeForState?.(node.state)
        const fontSize = node.state.length > 6 ? 9 : node.state.length > 3 ? 11 : 13

        return (
          <g key={node.state}>
            {dfa.start === node.state && node.reachable && (
              <line
                x1={node.x - radius - 34}
                y1={node.y}
                x2={node.x - radius - 4}
                y2={node.y}
                stroke="#475569"
                strokeWidth={1.6}
                markerEnd="url(#dfa-arrow)"
              />
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r={radius}
              fill={color.fill}
              stroke={stroke}
              strokeWidth={highlighted ? 3 : 2}
              strokeDasharray={node.reachable ? undefined : '5 4'}
            />
            {accepting && (
              <circle
                cx={node.x}
                cy={node.y}
                r={radius - 5}
                fill="none"
                stroke={stroke}
                strokeWidth={1.5}
                strokeDasharray={node.reachable ? undefined : '4 3'}
              />
            )}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              className="mono"
              fill={color.text}
            >
              {node.state}
            </text>
            {badge && (
              <g>
                <circle
                  cx={node.x + radius * 0.82}
                  cy={node.y - radius * 0.82}
                  r={9}
                  fill="#ffffff"
                  stroke={color.stroke}
                  strokeWidth={1.5}
                />
                <text
                  x={node.x + radius * 0.82}
                  y={node.y - radius * 0.82}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fill={color.stroke}
                >
                  {badge}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
