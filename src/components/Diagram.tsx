import { useId, useMemo } from 'react'
import type { DFA, StateId } from '../types/dfa'
import { layoutDfa } from '../lib/layout'
import { curvedPath, groupEdges, selfLoopPath } from '../lib/edgeGeometry'
import { HIGHLIGHT_STROKE, NEUTRAL_COLOR, type BlockColor } from '../lib/palette'

interface DiagramProps {
  dfa: DFA
  colorForState?: (state: StateId) => BlockColor
  badgeForState?: (state: StateId) => string | undefined
  highlightStates?: Set<StateId>
  ariaLabel?: string
}

export function Diagram({
  dfa,
  colorForState,
  badgeForState,
  highlightStates,
  ariaLabel = 'State diagram',
}: DiagramProps) {
  const layout = useMemo(() => layoutDfa(dfa), [dfa])
  const edges = useMemo(() => groupEdges(dfa), [dfa])
  const { byState, radius } = layout
  const markerId = `arrow-${useId().replace(/:/g, '')}`

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <marker
          id={markerId}
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
        if (!a || !b) return null
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
              markerEnd={`url(#${markerId})`}
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
                markerEnd={`url(#${markerId})`}
              />
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r={radius}
              style={{ fill: color.fill, stroke }}
              strokeWidth={highlighted ? 3 : 2}
              strokeDasharray={node.reachable ? undefined : '5 4'}
            />
            {accepting && (
              <circle
                cx={node.x}
                cy={node.y}
                r={radius - 5}
                fill="none"
                style={{ stroke }}
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
              style={{ fill: color.text }}
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
                  style={{ stroke: color.stroke }}
                  strokeWidth={1.5}
                />
                <text
                  x={node.x + radius * 0.82}
                  y={node.y - radius * 0.82}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  style={{ fill: color.stroke }}
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
