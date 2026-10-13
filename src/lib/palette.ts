export interface BlockColor {
  fill: string
  stroke: string
  text: string
}

/** Obsidian-flavoured dark palette: translucent fills, bright strokes. */
export const BLOCK_COLORS: BlockColor[] = [
  { fill: 'rgba(2,122,255,0.18)', stroke: '#4d9bff', text: '#a9cfff' },
  { fill: 'rgba(250,153,205,0.16)', stroke: '#fa99cd', text: '#f7c6e2' },
  { fill: 'rgba(68,207,110,0.16)', stroke: '#44cf6e', text: '#a9ebb9' },
  { fill: 'rgba(224,222,113,0.16)', stroke: '#e0de71', text: '#eeecae' },
  { fill: 'rgba(168,130,255,0.18)', stroke: '#a882ff', text: '#d3c0ff' },
  { fill: 'rgba(251,70,76,0.16)', stroke: '#fb464c', text: '#f7a2a5' },
  { fill: 'rgba(83,223,221,0.16)', stroke: '#53dfdd', text: '#a9efee' },
  { fill: 'rgba(176,220,80,0.16)', stroke: '#b0dc50', text: '#d6ecaa' },
  { fill: 'rgba(233,151,63,0.16)', stroke: '#e9973f', text: '#f4c493' },
  { fill: 'rgba(136,117,255,0.2)', stroke: '#8875ff', text: '#c3b8ff' },
]

export function colorForBlock(index: number): BlockColor {
  return BLOCK_COLORS[index % BLOCK_COLORS.length]
}

export const NEUTRAL_COLOR: BlockColor = {
  fill: '#232323',
  stroke: '#3f3f3f',
  text: '#dadada',
}

export const REMOVED_COLOR: BlockColor = {
  fill: '#1f1f1f',
  stroke: '#333333',
  text: '#6f6f6f',
}

export const HIGHLIGHT_STROKE = '#e0de71'

/** Shared edge/label colours for the diagrams. */
export const EDGE_COLOR = '#595959'
export const EDGE_LABEL_COLOR = '#b3b3b3'
export const EDGE_HALO_COLOR = '#1c1c1c'
