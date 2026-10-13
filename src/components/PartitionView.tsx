import type { DFA, MinStep } from '../types/dfa'
import { colorForBlock } from '../lib/palette'

interface PartitionViewProps {
  step: MinStep
  dfa: DFA
}

export function PartitionView({ step, dfa }: PartitionViewProps) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate-600">{step.description}</p>

      <div className="flex flex-wrap gap-3">
        {step.partitions.map((block, index) => {
          const color = colorForBlock(index)
          return (
            <div
              key={index}
              className="rounded-lg border-2 px-3 py-2"
              style={{ borderColor: color.stroke, backgroundColor: color.fill }}
            >
              <div
                className="mb-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: color.text }}
              >
                Block {index + 1}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {block.map((state) => (
                  <span
                    key={state}
                    className="mono rounded bg-white/80 px-2 py-0.5 text-sm"
                    style={{ color: color.text }}
                  >
                    {state}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {step.removed && step.removed.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="font-medium">Removed (unreachable):</span>
          {step.removed.map((state) => (
            <span key={state} className="mono rounded bg-slate-100 px-2 py-0.5 line-through">
              {state}
            </span>
          ))}
        </div>
      )}

      {step.signatures && (
        <div className="mt-3 rounded-md bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-500">
            Signature — block reached on each symbol ({dfa.alphabet.join(', ')})
          </div>
          <div className="mono mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {(step.splitBlock ?? Object.keys(step.signatures)).map((state) => (
              <span key={state}>
                {state} → ({step.signatures![state].map((n) => n + 1).join(', ')})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
