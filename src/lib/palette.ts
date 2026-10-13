export interface BlockColor {
  fill: string
  stroke: string
  text: string
}

export const BLOCK_COLORS: BlockColor[] = [
  { fill: '#dbeafe', stroke: '#2563eb', text: '#1e40af' },
  { fill: '#fce7f3', stroke: '#db2777', text: '#9d174d' },
  { fill: '#dcfce7', stroke: '#16a34a', text: '#166534' },
  { fill: '#fef9c3', stroke: '#ca8a04', text: '#854d0e' },
  { fill: '#ede9fe', stroke: '#7c3aed', text: '#5b21b6' },
  { fill: '#ffe4e6', stroke: '#e11d48', text: '#9f1239' },
  { fill: '#cffafe', stroke: '#0891b2', text: '#155e75' },
  { fill: '#ecfccb', stroke: '#65a30d', text: '#3f6212' },
  { fill: '#ffedd5', stroke: '#ea580c', text: '#9a3412' },
  { fill: '#e0e7ff', stroke: '#4f46e5', text: '#3730a3' },
]

export function colorForBlock(index: number): BlockColor {
  return BLOCK_COLORS[index % BLOCK_COLORS.length]
}

export const NEUTRAL_COLOR: BlockColor = {
  fill: '#f8fafc',
  stroke: '#94a3b8',
  text: '#334155',
}

export const REMOVED_COLOR: BlockColor = {
  fill: '#f1f5f9',
  stroke: '#cbd5e1',
  text: '#94a3b8',
}

export const HIGHLIGHT_STROKE = '#f59e0b'
