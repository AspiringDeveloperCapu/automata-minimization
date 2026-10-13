import type { DFA, MinimizationResult, MinStep, StateId } from '../types/dfa'
import { removeUnreachable } from './reachable'

function clonePartitions(partitions: StateId[][]): StateId[][] {
  return partitions.map((block) => [...block])
}

function blockIndexMap(partitions: StateId[][]): Map<StateId, number> {
  const map = new Map<StateId, number>()
  partitions.forEach((block, i) => block.forEach((s) => map.set(s, i)))
  return map
}

function formatBlock(block: StateId[]): string {
  return `{${block.join(', ')}}`
}

/**
 * Moore's partition-refinement minimization of a DFA.
 *
 * Returns an ordered list of snapshots (one per phase/round) suitable for a
 * step-by-step animation, plus the resulting minimal DFA.
 */
export function minimize(input: DFA): MinimizationResult {
  const steps: MinStep[] = []

  // Phase 0 — remove unreachable states.
  const { dfa, reachable, removed } = removeUnreachable(input)

  steps.push({
    kind: 'unreachable',
    partitions: reachable.length ? [reachable] : [],
    removed,
    description:
      removed.length > 0
        ? `Removed ${removed.length} unreachable state(s): ${removed.join(', ')}. ${reachable.length} state(s) remain.`
        : 'Every state is reachable from the start state, so nothing is removed.',
  })

  // Phase 1 — initial partition by acceptance.
  const accepting = reachable.filter((s) => dfa.accepting.includes(s))
  const nonAccepting = reachable.filter((s) => !dfa.accepting.includes(s))
  let partitions: StateId[][] = []
  if (accepting.length) partitions.push(accepting)
  if (nonAccepting.length) partitions.push(nonAccepting)

  const initialParts: string[] = []
  if (accepting.length) initialParts.push(`accepting ${formatBlock(accepting)}`)
  if (nonAccepting.length) initialParts.push(`non-accepting ${formatBlock(nonAccepting)}`)
  steps.push({
    kind: 'initial',
    partitions: clonePartitions(partitions),
    description: `Initial partition by acceptance: ${initialParts.join(' and ')}.`,
  })

  // Phase 2 — refine until stable.
  let round = 1
  while (true) {
    const index = blockIndexMap(partitions)
    const nextPartitions: StateId[][] = []
    const splitBlocks: StateId[][] = []
    const signatures: Record<StateId, number[]> = {}
    let anySplit = false

    for (const block of partitions) {
      const groups = new Map<string, StateId[]>()
      for (const state of block) {
        const signature = dfa.alphabet.map((sym) => index.get(dfa.transitions[state][sym]) ?? -1)
        signatures[state] = signature
        const key = signature.join(',')
        const group = groups.get(key)
        if (group) group.push(state)
        else groups.set(key, [state])
      }

      if (groups.size > 1) {
        anySplit = true
        splitBlocks.push(block)
        for (const group of groups.values()) nextPartitions.push(group)
      } else {
        nextPartitions.push(block)
      }
    }

    if (!anySplit) {
      steps.push({
        kind: 'stable',
        partitions: clonePartitions(partitions),
        description: `No block can be split further. The DFA is minimal with ${partitions.length} state(s).`,
      })
      break
    }

    const splitDescriptions = splitBlocks.map((block) => {
      const subBlocks = nextPartitions.filter((nb) => nb.every((s) => block.includes(s)))
      return `${formatBlock(block)} → ${subBlocks.map(formatBlock).join(' | ')}`
    })

    steps.push({
      kind: 'refine',
      partitions: clonePartitions(nextPartitions),
      splitBlock: splitBlocks.length === 1 ? splitBlocks[0] : undefined,
      signatures: { ...signatures },
      description: `Round ${round}: split ${splitDescriptions.join('; ')}.`,
    })

    partitions = nextPartitions
    round++
  }

  const blockOf: Record<StateId, number> = {}
  partitions.forEach((block, i) => block.forEach((s) => (blockOf[s] = i)))

  return { steps, minimized: buildMinimizedDfa(dfa, partitions, blockOf), blockOf }
}

function blockName(block: StateId[]): StateId {
  return block.length === 1 ? block[0] : `{${block.join(',')}}`
}

function buildMinimizedDfa(
  dfa: DFA,
  partitions: StateId[][],
  blockOf: Record<StateId, number>,
): DFA {
  const states = partitions.map(blockName)
  const start = blockName(partitions[blockOf[dfa.start]])
  const accepting = partitions
    .map((block, i) => (block.some((s) => dfa.accepting.includes(s)) ? i : -1))
    .filter((i) => i >= 0)
    .map((i) => states[i])

  const transitions: DFA['transitions'] = {}
  partitions.forEach((block, i) => {
    const representative = block[0]
    transitions[states[i]] = {}
    for (const symbol of dfa.alphabet) {
      const targetBlock = blockOf[dfa.transitions[representative][symbol]]
      transitions[states[i]][symbol] = states[targetBlock]
    }
  })

  return {
    states,
    alphabet: [...dfa.alphabet],
    start,
    accepting,
    transitions,
  }
}
