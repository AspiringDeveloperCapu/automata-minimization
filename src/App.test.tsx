import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('renders the editor, both graphs and a valid DFA for the default sample', () => {
    renderApp()
    expect(screen.getByText('DFA Minimization')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Original state diagram' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Original to minimal state diagram' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Valid DFA/i)).toBeInTheDocument()
  })

  it('shows the first refinement step and the animation panel', () => {
    renderApp()
    expect(screen.getByRole('heading', { name: /Partition refinement/i })).toBeInTheDocument()
    expect(screen.getByText(/Every state is reachable/i)).toBeInTheDocument()
  })

  it('keeps earlier partition steps visible as you advance', async () => {
    const user = userEvent.setup()
    renderApp()
    const next = screen.getByRole('button', { name: /next step/i })
    await user.click(next)
    await user.click(next)
    await user.click(next)
    expect(screen.getByText('Preprocess')).toBeInTheDocument()
    expect(screen.getByText('Initial')).toBeInTheDocument()
    expect(screen.getByText('Refine')).toBeInTheDocument()
    expect(screen.getByText('Stable')).toBeInTheDocument()
  })

  it('opens the download drawer with the minimal DFA', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /download/i }))
    expect(screen.getByRole('dialog', { name: /result and export/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Minimized state diagram' })).toBeInTheDocument()
  })
})
