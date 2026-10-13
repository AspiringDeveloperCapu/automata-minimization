import type { ValidationIssue } from '../types/dfa'

export function ValidationList({ issues }: { issues: ValidationIssue[] }) {
  const errors = issues.filter((i) => i.level === 'error')
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="text-sm font-medium text-red-700">
        Fix these problems before minimizing:
      </p>
      <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-red-600">
        {errors.map((issue, index) => (
          <li key={index}>{issue.message}</li>
        ))}
      </ul>
    </div>
  )
}
