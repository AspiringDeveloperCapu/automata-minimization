import { useState } from 'react'
import type { DFA } from '../types/dfa'
import { dfaToSerializable } from '../lib/dfa'

interface ResultPanelProps {
  original: DFA
  minimized: DFA
}

export function ResultPanel({ original, minimized }: ResultPanelProps) {
  const [copied, setCopied] = useState(false)

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
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-600">
          Original: <strong>{original.states.length}</strong> state(s)
        </span>
        <span className="text-slate-400">→</span>
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-700">
          Minimal: <strong>{minimized.states.length}</strong> state(s)
        </span>
        {saved > 0 && (
          <span className="text-xs text-slate-400">({saved} merged/removed)</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="border-b border-slate-200 px-2 py-2">State</th>
              <th className="border-b border-slate-200 px-2 py-2 text-center">Start</th>
              <th className="border-b border-slate-200 px-2 py-2 text-center">Accept</th>
              {minimized.alphabet.map((symbol) => (
                <th key={symbol} className="mono border-b border-slate-200 px-2 py-2 text-center">
                  {symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {minimized.states.map((state) => (
              <tr key={state} className="hover:bg-slate-50">
                <td className="mono border-b border-slate-100 px-2 py-1.5">{state}</td>
                <td className="border-b border-slate-100 px-2 py-1.5 text-center">
                  {minimized.start === state ? '→' : ''}
                </td>
                <td className="border-b border-slate-100 px-2 py-1.5 text-center">
                  {minimized.accepting.includes(state) ? '✓' : ''}
                </td>
                {minimized.alphabet.map((symbol) => (
                  <td
                    key={symbol}
                    className="mono border-b border-slate-100 px-2 py-1.5 text-center"
                  >
                    {minimized.transitions[state]?.[symbol] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
