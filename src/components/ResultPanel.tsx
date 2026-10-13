import { useState } from 'react'
import type { DFA, StateId } from '../types/dfa'
import { dfaToSerializable } from '../lib/dfa'
import { colorForBlock } from '../lib/palette'
import { Diagram } from './Diagram'

interface ResultPanelProps {
  original: DFA
  minimized: DFA
}

export function ResultPanel({ original, minimized }: ResultPanelProps) {
  const [copied, setCopied] = useState(false)

  const blockIndexOf = (state: StateId) => minimized.states.indexOf(state)

  const json = JSON.stringify(dfaToSerializable(minimized), null, 2)

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'minimized-dfa.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const saved = original.states.length - minimized.states.length

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-md bg-elevated px-2.5 py-1 text-ink-muted">
          Original: <strong>{original.states.length}</strong> state(s)
        </span>
        <span className="text-ink-faint">→</span>
        <span className="rounded-md bg-success/15 px-2.5 py-1 text-success">
          Minimal: <strong>{minimized.states.length}</strong> state(s)
        </span>
        {saved > 0 && (
          <span className="text-xs text-ink-faint">({saved} merged/removed)</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-sm font-medium text-ink-muted shadow-sm transition hover:border-line-strong hover:bg-elevated hover:text-ink"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="border-b border-line px-2 py-2">State</th>
                <th className="border-b border-line px-2 py-2 text-center">Start</th>
                <th className="border-b border-line px-2 py-2 text-center">Accept</th>
                {minimized.alphabet.map((symbol) => (
                  <th key={symbol} className="mono border-b border-line px-2 py-2 text-center">
                    {symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {minimized.states.map((state) => (
                <tr key={state} className="transition hover:bg-elevated/60">
                  <td className="mono border-b border-line/70 px-2 py-1.5">{state}</td>
                  <td className="border-b border-line/70 px-2 py-1.5 text-center">
                    {minimized.start === state ? '→' : ''}
                  </td>
                  <td className="border-b border-line/70 px-2 py-1.5 text-center">
                    {minimized.accepting.includes(state) ? '✓' : ''}
                  </td>
                  {minimized.alphabet.map((symbol) => (
                    <td
                      key={symbol}
                      className="mono border-b border-line/70 px-2 py-1.5 text-center"
                    >
                      {minimized.transitions[state]?.[symbol] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-lg border border-line bg-surface p-2">
          <Diagram
            dfa={minimized}
            ariaLabel="Minimized state diagram"
            colorForState={(state) => colorForBlock(Math.max(0, blockIndexOf(state)))}
            badgeForState={(state) => String(blockIndexOf(state) + 1)}
          />
        </div>
      </div>
    </div>
  )
}
