import type { DFA, StateId } from '../types/dfa'
import { reachableStates } from './reachable'

export const NODE_RADIUS = 24

export interface LaidOutNode {
  state: StateId
  x: number
  y: number
  depth: number
  reachable: boolean
}

export interface DiagramLayout {
  nodes: LaidOutNode[]
  byState: Record<StateId, LaidOutNode>
  width: number
  height: number
  radius: number
}

const H_GAP = 172
const V_GAP = 112
const PAD_X = 74
const PAD_Y = 64

/**
 * Places nodes in columns by their BFS distance from the start state, and
 * parks any unreachable states in a trailing column.
 */
export function layoutDfa(dfa: DFA): DiagramLayout {
  if (dfa.states.length === 0) {
    return { nodes: [], byState: {}, width: 240, height: 160, radius: NODE_RADIUS }
  }

  const reachable = reachableStates(dfa)
  const reachableSet = new Set(reachable)

  const depth: Record<StateId, number> = {}
  const queue: StateId[] = []
  if (reachableSet.has(dfa.start)) {
    depth[dfa.start] = 0
    queue.push(dfa.start)
  }
  while (queue.length) {
    const state = queue.shift() as StateId
    for (const symbol of dfa.alphabet) {
      const target = dfa.transitions[state]?.[symbol]
      if (target !== undefined && depth[target] === undefined) {
        depth[target] = depth[state] + 1
        queue.push(target)
      }
    }
  }

  const columns = new Map<number, StateId[]>()
  for (const state of reachable) {
    const d = depth[state] ?? 0
    const column = columns.get(d)
    if (column) column.push(state)
    else columns.set(d, [state])
  }

  const unreachable = dfa.states.filter((s) => !reachableSet.has(s))
  const maxDepth = columns.size ? Math.max(...columns.keys()) : 0
  const unreachableDepth = unreachable.length ? maxDepth + 1 : maxDepth

  const tallest = Math.max(
    1,
    ...[...columns.values()].map((c) => c.length),
    unreachable.length,
  )
  const height = PAD_Y * 2 + (tallest - 1) * V_GAP + NODE_RADIUS * 2

  const nodes: LaidOutNode[] = []
  const place = (state: StateId, columnIndex: number, rowIndex: number, rows: number, isReachable: boolean) => {
    const x = PAD_X + columnIndex * H_GAP
    const columnHeight = (rows - 1) * V_GAP
    const y = height / 2 - columnHeight / 2 + rowIndex * V_GAP
    nodes.push({ state, x, y, depth: columnIndex, reachable: isReachable })
  }

  for (const [d, states] of [...columns.entries()].sort((a, b) => a[0] - b[0])) {
    states.forEach((s, i) => place(s, d, i, states.length, true))
  }
  unreachable.forEach((s, i) => place(s, unreachableDepth, i, unreachable.length, false))

  const width = PAD_X * 2 + unreachableDepth * H_GAP + NODE_RADIUS * 2

  const byState: Record<StateId, LaidOutNode> = {}
  for (const node of nodes) byState[node.state] = node

  return { nodes, byState, width, height, radius: NODE_RADIUS }
}
