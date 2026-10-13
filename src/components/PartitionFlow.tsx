import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { DFA, MinStep, StateId, StepKind } from '../types/dfa'
import { colorForBlock } from '../lib/palette'

interface PartitionFlowProps {
  steps: MinStep[]
  current: number
  dfa: DFA
}

const TOKEN_W = 48
const TOKEN_H = 34
const GAP_IN = 14
const GAP_BETWEEN = 54
const ROW_H = 60
const PAD = 22

const KIND_LABEL: Record<StepKind, string> = {
  unreachable: 'Preprocess',
  initial: 'Initial',
  refine: 'Refine',
  stable: 'Stable',
}

interface Token {
  state: StateId
  block: number
  x: number
  y: number
  fromX: number
  fromY: number
}

interface Group {
  block: number
  x: number
  y: number
  w: number
  h: number
}

interface Row {
  step: MinStep
  tokens: Token[]
  groups: Group[]
}

function buildRows(steps: MinStep[], current: number) {
  const visible = steps.slice(0, current + 1)

  const layouts = visible.map((step) => {
    const positions: { state: StateId; block: number; left: number }[] = []
    const groups: { block: number; left: number; w: number }[] = []
    let cursor = 0

    step.partitions.forEach((block, blockIndex) => {
      const start = cursor
      block.forEach((state) => {
        positions.push({ state, block: blockIndex, left: cursor })
        cursor += TOKEN_W + GAP_IN
      })
      const end = cursor - GAP_IN
      groups.push({ block: blockIndex, left: start, w: Math.max(TOKEN_W, end - start) })
      cursor = end + GAP_BETWEEN
    })

    return { step, positions, groups, rowWidth: Math.max(TOKEN_W, cursor - GAP_BETWEEN) }
  })

  const width = Math.max(TOKEN_W, ...layouts.map((l) => l.rowWidth))

  const rows: Row[] = layouts.map((layout, rowIndex) => {
    const y = PAD + rowIndex * ROW_H
    const offset = (width - layout.rowWidth) / 2
    const tokens = layout.positions.map((p) => ({
      state: p.state,
      block: p.block,
      x: offset + p.left,
      y,
      fromX: offset + p.left,
      fromY: y,
    }))
    const groups = layout.groups.map((g) => ({
      block: g.block,
      x: offset + g.left - 8,
      y: y - 6,
      w: g.w + 16,
      h: TOKEN_H + 12,
    }))
    return { step: layout.step, tokens, groups }
  })

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const previous = new Map(rows[rowIndex - 1].tokens.map((t) => [t.state, t]))
    for (const token of rows[rowIndex].tokens) {
      const prev = previous.get(token.state)
      if (prev) {
        token.fromX = prev.x
        token.fromY = prev.y
      }
    }
  }

  const height = PAD * 2 + Math.max(0, rows.length - 1) * ROW_H + TOKEN_H
  return { rows, width, height }
}

function TokenView({ token }: { token: Token }) {
  const [pos, setPos] = useState({ x: token.fromX, y: token.fromY })

  useEffect(() => {
    const id = requestAnimationFrame(() => setPos({ x: token.x, y: token.y }))
    return () => cancelAnimationFrame(id)
  }, [token.x, token.y])

  const color = colorForBlock(token.block)

  return (
    <div
      className="pf-token mono"
      style={{
        width: TOKEN_W,
        height: TOKEN_H,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        borderColor: color.stroke,
        backgroundColor: color.fill,
        color: color.text,
      }}
    >
      {token.state}
    </div>
  )
}

export function PartitionFlow({ steps, current, dfa }: PartitionFlowProps) {
  const { rows, width, height } = useMemo(
    () => buildRows(steps, current),
    [steps, current],
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [current])

  const activeStep = steps[current]
  const removed = steps[0]?.removed ?? []

  return (
    <div>
      {removed.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="font-medium">Removed (unreachable):</span>
          {removed.map((state) => (
            <span key={state} className="mono rounded bg-slate-100 px-1.5 py-0.5 line-through">
              {state}
            </span>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="max-h-[52vh] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/40 p-3">
        <div className="relative mx-auto" style={{ width, height }}>
          {rows.map((row, rowIndex) => (
            <Fragment key={rowIndex}>
              <div
                className="pf-row-label"
                style={{ top: row.tokens[0]?.y ?? 0, opacity: rowIndex === current ? 1 : 0.4 }}
              >
                {KIND_LABEL[row.step.kind]}
              </div>

              {row.groups.map((group) => {
                const color = colorForBlock(group.block)
                return (
                  <div
                    key={`g-${group.block}`}
                    className="pf-group"
                    style={{
                      left: group.x,
                      top: group.y,
                      width: group.w,
                      height: group.h,
                      borderColor: color.stroke,
                      backgroundColor: color.fill,
                    }}
                  />
                )
              })}

              {row.tokens.map((token) => (
                <TokenView key={`${rowIndex}-${token.state}`} token={token} />
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {activeStep && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{activeStep.description}</p>
      )}

      {activeStep?.signatures && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-500">
            Signature — block reached on each symbol ({dfa.alphabet.join(', ')})
          </div>
          <div className="mono mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {(activeStep.splitBlock ?? Object.keys(activeStep.signatures)).map((state) => (
              <span key={state}>
                {state} → ({activeStep.signatures![state].map((n) => n + 1).join(', ')})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
