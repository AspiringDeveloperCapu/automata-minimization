import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { AutomatonProvider } from './context/AutomatonProvider'

function renderApp() {
  return render(
    <AutomatonProvider>
      <App />
    </AutomatonProvider>,
  )
}

describe('App', () => {
  it('renders the editor, diagram and a valid DFA for the default sample', () => {
    renderApp()
    expect(screen.getByText('DFA Minimization')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /state diagram/i })).toBeInTheDocument()
    expect(screen.getByText(/Valid DFA/i)).toBeInTheDocument()
  })

  it('shows the first refinement step and the minimal result', () => {
    renderApp()
    expect(screen.getByText(/Every state is reachable/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Minimal DFA/i })).toBeInTheDocument()
  })
})
