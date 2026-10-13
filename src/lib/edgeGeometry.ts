import type { DFA, StateId } from '../types/dfa'

export interface Point {
  x: number
  y: number
}

export interface EdgeGroup {
  from: StateId
  to: StateId
  symbols: string[]
  curve: number
}

export interface EdgeGeometry {
  path: string
  label: Point
}

/** Group parallel transitions (same source/target) into a single drawn edge. */
export function groupEdges(dfa: DFA): EdgeGroup[] {
  const present = new Set(dfa.states)
  const groups = new Map<string, EdgeGroup>()

  for (const from of dfa.states) {
    for (const symbol of dfa.alphabet) {
      const to = dfa.transitions[from]?.[symbol]
      if (to === undefined || !present.has(to)) continue
      const key = `${from}\u0000${to}`
      const existing = groups.get(key)
      if (existing) existing.symbols.push(symbol)
      else groups.set(key, { from, to, symbols: [symbol], curve: 0 })
    }
  }

  const list = [...groups.values()]
  const hasReverse = new Set<string>()
  for (const group of list) hasReverse.add(`${group.to}\u0000${group.from}`)
  for (const group of list) {
    if (group.from !== group.to && hasReverse.has(`${group.from}\u0000${group.to}`)) {
      group.curve = 30
    }
  }
  return list
}

export function anchor(point: Point, toward: Point, radius: number): Point {
  const dx = toward.x - point.x
  const dy = toward.y - point.y
  const dist = Math.hypot(dx, dy) || 1
  return { x: point.x + (dx / dist) * radius, y: point.y + (dy / dist) * radius }
}

export function curvedPath(a: Point, b: Point, radius: number, curve: number): EdgeGeometry {
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

export function selfLoopPath(node: Point, radius: number): EdgeGeometry {
  const r = radius * 1.7
  const start = { x: node.x - radius * 0.6, y: node.y - radius * 0.75 }
  const end = { x: node.x + radius * 0.6, y: node.y - radius * 0.75 }
  return {
    path: `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`,
    label: { x: node.x, y: node.y - radius - 42 },
  }
}
