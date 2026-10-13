import type { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function Card({ title, subtitle, actions, children, className, bodyClassName }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className ?? ''}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-700">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={`p-4 ${bodyClassName ?? ''}`}>{children}</div>
    </section>
  )
}
