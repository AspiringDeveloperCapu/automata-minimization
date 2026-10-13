import type { DFA } from '../types/dfa'

export interface Sample {
  id: string
  name: string
  description: string
  dfa: DFA
}

function build(
  states: string[],
  alphabet: string[],
  start: string,
  accepting: string[],
  rows: Record<string, Record<string, string>>,
): DFA {
  return { states, alphabet, start, accepting, transitions: rows }
}

export const SAMPLES: Sample[] = [
  {
    id: 'redundant',
    name: 'Redundant accept states',
    description:
      'q1 and q2 accept and behave identically, so they merge. 4 states → 3.',
    dfa: build(
      ['q0', 'q1', 'q2', 'q3'],
      ['a', 'b'],
      'q0',
      ['q1', 'q2'],
      {
        q0: { a: 'q1', b: 'q2' },
        q1: { a: 'q1', b: 'q3' },
        q2: { a: 'q1', b: 'q3' },
        q3: { a: 'q3', b: 'q3' },
      },
    ),
  },
  {
    id: 'ends-with-a',
    name: 'Ends with "a"',
    description: 'Already minimal — runs straight to the stable partition.',
    dfa: build(['q0', 'q1'], ['a', 'b'], 'q0', ['q1'], {
      q0: { a: 'q1', b: 'q0' },
      q1: { a: 'q1', b: 'q0' },
    }),
  },
  {
    id: 'unreachable',
    name: 'Unreachable state',
    description: 'q2 can never be entered from the start, so it is dropped first.',
    dfa: build(
      ['q0', 'q1', 'q2'],
      ['a', 'b'],
      'q0',
      ['q1'],
      {
        q0: { a: 'q1', b: 'q0' },
        q1: { a: 'q1', b: 'q0' },
        q2: { a: 'q2', b: 'q2' },
      },
    ),
  },
  {
    id: 'classic',
    name: 'Classic refinement',
    description:
      'Textbook example: repeated rounds split the accepting and non-accepting blocks.',
    dfa: build(
      ['A', 'B', 'C', 'D', 'E'],
      ['0', '1'],
      'A',
      ['C', 'D'],
      {
        A: { '0': 'B', '1': 'C' },
        B: { '0': 'A', '1': 'D' },
        C: { '0': 'E', '1': 'A' },
        D: { '0': 'E', '1': 'A' },
        E: { '0': 'E', '1': 'A' },
      },
    ),
  },
]
