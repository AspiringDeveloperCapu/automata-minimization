# DFA Minimization

An interactive UI that minimizes a **Deterministic Finite Automaton** using
**Moore's partition-refinement** algorithm, with a step-by-step animation and a
live state diagram.

## Features

- **Transition table editor** — add/remove states and alphabet symbols, edit
  names, mark the start state, toggle accepting states, and set every
  transition with dropdowns.
- **Validation** — missing or invalid transitions are flagged inline; you can
  complete a partial automaton with one click via a dead/sink state.
- **Unreachable-state removal** — the preprocessing step is shown explicitly.
- **Step-by-step refinement** — play, pause, scrub, or step through each round.
  Every round shows the current partition blocks, the transition "signature"
  that caused each split, and a plain-English explanation.
- **Live state diagram** — a hand-rolled SVG graph. States are coloured by their
  current block, block numbers are badged on the nodes, and the block being
  split is highlighted.
- **Result export** — the minimal DFA is shown as a table and can be copied or
  downloaded as JSON.

## The algorithm

1. **Remove unreachable states** — BFS from the start state.
2. **Initial partition** — split reachable states into accepting and
   non-accepting groups.
3. **Refine** — repeat until stable: within each block, group states by the
   tuple of *block indices* their transitions lead to for each symbol. A block
   splits when two states reach different blocks on some symbol.
4. **Build the quotient DFA** — one state per final block; the start state is
   the block containing the original start; a block is accepting if it contains
   an accepting state.

The implementation returns an ordered list of snapshots (one per phase/round),
which is exactly what the UI animates.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and produce a production build in dist/
npm run preview  # preview the production build
npm test         # run the Vitest unit tests
npm run lint     # run ESLint
```

## Project layout

```
src/
  components/         UI components (table, diagram, playback, result)
  context/            Automaton state (useReducer) and provider
  hooks/              usePlayback animation hook
  lib/
    dfa.ts            DFA helpers: validate, clone, dead state, simulate
    reachable.ts      Reachable-state computation and removal
    minimize.ts       Moore's partition refinement -> steps + minimal DFA
    layout.ts         SVG node layout (columns by BFS depth)
    palette.ts        Colours for partition blocks
    samples.ts        Bundled example automata
    *.test.ts         Unit tests
  types/dfa.ts        Shared TypeScript types
  App.tsx             Top-level wiring
```

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Vitest + Testing Library.
