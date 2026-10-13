import { useEffect, useState } from 'react'

interface CommitInputProps {
  value: string
  onCommit: (value: string) => void
  className?: string
  ariaLabel?: string
}

/** Text input that only commits on blur or Enter, and reverts on Escape. */
export function CommitInput({ value, onCommit, className, ariaLabel }: CommitInputProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onCommit(trimmed)
    else setDraft(value)
  }

  return (
    <input
      value={draft}
      aria-label={ariaLabel}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          commit()
          event.currentTarget.blur()
        } else if (event.key === 'Escape') {
          setDraft(value)
          event.currentTarget.blur()
        }
      }}
      className={
        className ??
        'w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-sm hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none'
      }
    />
  )
}
