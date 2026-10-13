import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { AutomatonProvider } from './context/AutomatonProvider'

function renderApp() {
  window.localStorage.clear()
  return render(
    <AutomatonProvider>
      <App />
    </AutomatonProvider>,
  )
}

describe('App', () => {
  it('renders the interactive graph and a valid DFA for the default sample', () => {
    renderApp()
    expect(screen.getByText('DFA Minimization')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Original state diagram' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Original' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Minimized' })).toBeInTheDocument()
    expect(screen.getByText(/Valid DFA/i)).toBeInTheDocument()
  })

  it('toggles the definition editor as a docked panel with the JSON import', async () => {
    const user = userEvent.setup()
    renderApp()
    expect(
      screen.queryByRole('complementary', { name: /definition editor/i }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /toggle definition editor/i }))
    const editor = screen.getByRole('complementary', { name: /definition editor/i })
    expect(editor).toHaveAttribute('data-dock', 'left')
    expect(within(editor).getByText(/Load a sample/i)).toBeInTheDocument()
    expect(within(editor).getByLabelText(/Transition from q0 on a/i)).toBeInTheDocument()
    expect(within(editor).getByRole('button', { name: /import json/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Original state diagram' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('complementary', { name: /definition editor/i }),
    ).not.toBeInTheDocument()
  })

  it('docks the editor at the top as a horizontal bar', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /toggle definition editor/i }))
    await user.click(screen.getByRole('button', { name: /dock definition editor at top/i }))
    const editor = screen.getByRole('complementary', { name: /definition editor/i })
    expect(editor).toHaveAttribute('data-dock', 'top')
    expect(screen.getByRole('separator', { name: /resize editor bar/i })).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    )
  })

  it('docks the partition panel at the bottom', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /dock partition refinement panel at bottom/i }))
    const panel = screen.getByRole('complementary', { name: /partition refinement panel/i })
    expect(panel).toHaveAttribute('data-dock', 'bottom')
    expect(screen.getByRole('separator', { name: /resize partition bar/i })).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    )
  })

  it('toggles the partition refinement panel', async () => {
    const user = userEvent.setup()
    renderApp()
    expect(
      screen.getByRole('heading', { name: /Partition refinement/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /hide partition panel/i }))
    expect(
      screen.queryByRole('heading', { name: /Partition refinement/i }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show partition panel/i }))
    expect(
      screen.getByRole('heading', { name: /Partition refinement/i }),
    ).toBeInTheDocument()
  })

  it('switches the graph between the original and minimized DFA', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Minimized' }))
    expect(screen.getByRole('img', { name: 'Minimized state diagram' })).toBeInTheDocument()
  })

  it('simulates an input string against the automaton', async () => {
    const user = userEvent.setup()
    renderApp()
    const input = screen.getByRole('textbox', { name: /input string/i })
    await user.type(input, 'aa')
    const step = screen.getByRole('button', { name: /step simulation/i })
    await user.click(step)
    await user.click(step)
    expect(screen.getByText('Accepted')).toBeInTheDocument()
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

  it('shows a resizable separator for the partition panel', () => {
    renderApp()
    expect(screen.getByRole('separator', { name: /animation panel/i })).toBeInTheDocument()
  })

  it('resizes a panel with the keyboard and persists the width', () => {
    renderApp()
    const right = screen.getByRole('separator', { name: /animation panel/i })
    expect(right).toHaveAttribute('aria-valuenow', '520')
    fireEvent.keyDown(right, { key: 'ArrowLeft' })
    expect(right).toHaveAttribute('aria-valuenow', '536')
    expect(window.localStorage.getItem('panel.right')).toBe('536')
  })

  it('clamps bar height so the graph stays reachable', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /toggle definition editor/i }))
    await user.click(screen.getByRole('button', { name: /dock definition editor at top/i }))
    const resizer = screen.getByRole('separator', { name: /resize editor bar/i })
    const max = Number(resizer.getAttribute('aria-valuemax'))
    expect(max).toBeLessThan(window.innerHeight)
    for (let i = 0; i < 40; i++) {
      fireEvent.keyDown(resizer, { key: 'ArrowDown', shiftKey: true })
    }
    expect(Number(resizer.getAttribute('aria-valuenow'))).toBe(max)
    expect(screen.getByRole('img', { name: 'Original state diagram' })).toBeInTheDocument()
  })
})
