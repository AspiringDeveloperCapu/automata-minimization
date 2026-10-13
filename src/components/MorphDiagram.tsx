import { useId, useMemo } from 'react'
import type { DFA, StateId } from '../types/dfa'
import { layoutDfa } from '../lib/layout'
import { curvedPath, groupEdges, selfLoopPath, type Point } from '../lib/edgeGeometry'
import { colorForBlock } from '../lib/palette'

interface MorphDiagramProps {
  original: DFA
  minimized: DFA
  /** The final partition: minimized.states[i] corresponds to blocks[i]. */
  blocks: StateId[][]
  /** 0 = original DFA, 1 = minimized DFA. */
  progress: number
  ariaLabel?: string
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Non-representative members stay solid early, then fade as they merge. */
function memberOpacity(t: number) {
  if (t <= 0.35) return 1
  return Math.max(0, 1 - (t - 0.35) / 0.55)
}

export function MorphDiagram({
  original,
  minimized,
  blocks,
  progress,
  ariaLabel = 'Original to minimal state diagram',
}: MorphDiagramProps) {
  const layout = useMemo(() => layoutDfa(original), [original])
  const origEdges = useMemo(() => groupEdges(original), [original])
  const minEdges = useMemo(() => groupEdges(minimized), [minimized])
  const markerId = `arrow-${useId().replace(/:/g, '')}`

  const { radius, byState } = layout
  const t = easeInOut(Math.min(1, Math.max(0, progress)))

  const blockOf = useMemo(() => {
    const map: Record<StateId, number> = {}
    blocks.forEach((block, index) => block.forEach((s) => (map[s] = index)))
    return map
  }, [blocks])

  const centroids = useMemo<Point[]>(
    () =>
      blocks.map((block) => {
        let x = 0
        let y = 0
        let n = 0
        for (const state of block) {
          const node = byState[state]
          if (node) {
            x += node.x
            y += node.y
            n++
          }
        }
        return n ? { x: x / n, y: y / n } : { x: 0, y: 0 }
      }),
    [blocks, byState],
  )

  const morphed = (state: StateId): Point => {
    const node = byState[state]
    if (!node) return { x: 0, y: 0 }
    const centroid = centroids[blockOf[state]] ?? node
    return { x: lerp(node.x, centroid.x, t), y: lerp(node.y, centroid.y, t) }
  }

  const firstStateOfBlock = blocks.map((block) => block[0])
  const minNameOfBlock = blocks.map((_, index) => minimized.states[index])
  const blockOfMinName = useMemo(() => {
    const map: Record<StateId, number> = {}
    minimized.states.forEach((name, index) => (map[name] = index))
    return map
  }, [minimized])

  const minPos = (minName: StateId): Point => {
    const blockIndex = blockOfMinName[minName]
    const rep = firstStateOfBlock[blockIndex]
    return rep ? morphed(rep) : { x: 0, y: 0 }
  }

  const startRep = firstStateOfBlock[blockOf[original.start]]

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

      {/* Original edges fading out while their endpoints merge. */}
      <g className="morph-fade" style={{ opacity: 1 - t }}>
        {origEdges.map((edge) => {
          const a = morphed(edge.from)
          const b = morphed(edge.to)
          const geometry =
            edge.from === edge.to ? selfLoopPath(a, radius) : curvedPath(a, b, radius, edge.curve)
          return (
            <g key={`o-${edge.from}->${edge.to}`}>
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
      </g>

      {/* Minimized edges fading in between the merged representatives. */}
      <g className="morph-fade" style={{ opacity: t }}>
        {minEdges.map((edge) => {
          const a = minPos(edge.from)
          const b = minPos(edge.to)
          const geometry =
            edge.from === edge.to ? selfLoopPath(a, radius) : curvedPath(a, b, radius, edge.curve)
          return (
            <g key={`m-${edge.from}->${edge.to}`}>
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
      </g>

      {/* Start arrows. */}
      <g
        className="morph-node"
        style={{
          opacity: 1 - t,
          transform: `translate(${morphed(original.start).x}px, ${morphed(original.start).y}px)`,
        }}
      >
        <line
          x1={-radius - 34}
          y1={0}
          x2={-radius - 4}
          y2={0}
          stroke="#475569"
          strokeWidth={1.6}
          markerEnd={`url(#${markerId})`}
        />
      </g>
      {startRep && (
        <g
          className="morph-node"
          style={{ opacity: t, transform: `translate(${morphed(startRep).x}px, ${morphed(startRep).y}px)` }}
        >
          <line
            x1={-radius - 34}
            y1={0}
            x2={-radius - 4}
            y2={0}
            stroke="#475569"
            strokeWidth={1.6}
            markerEnd={`url(#${markerId})`}
          />
        </g>
      )}

      {/* Nodes. */}
      {layout.nodes.map((node) => {
        const isRepresentative = firstStateOfBlock[blockOf[node.state]] === node.state
        const position = morphed(node.state)
        const color = colorForBlock(blockOf[node.state] ?? 0)
        const opacity = isRepresentative ? 1 : memberOpacity(t)
        const accepting = original.accepting.includes(node.state)
        const blockName = minNameOfBlock[blockOf[node.state]]
        const fontSize = node.state.length > 6 ? 9 : node.state.length > 3 ? 11 : 13

        return (
          <g
            key={node.state}
            className="morph-node"
            style={{ opacity, transform: `translate(${position.x}px, ${position.y}px)` }}
          >
            {accepting && (
              <circle r={radius - 5} fill="none" style={{ stroke: color.stroke }} strokeWidth={1.5} />
            )}
            <circle r={radius} style={{ fill: color.fill, stroke: color.stroke }} strokeWidth={2} />
            {isRepresentative && blockName !== node.state ? (
              <>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  className="mono"
                  style={{ fill: color.text, opacity: 1 - t }}
                >
                  {node.state}
                </text>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  className="mono"
                  style={{ fill: color.text, opacity: t }}
                >
                  {blockName}
                </text>
              </>
            ) : (
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                className="mono"
                style={{ fill: color.text }}
              >
                {node.state}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
