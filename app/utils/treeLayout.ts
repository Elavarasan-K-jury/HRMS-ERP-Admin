export const CARD_WIDTH = 340
export const GAP = 48
export const CONNECTOR_HEIGHT = 32
export const JUNCTION_Y = 12

export interface NodeLayout {
  subtreeWidth: number
  childLayouts: NodeLayout[]
  stemX: number
  barStart: number
  barEnd: number
  dropPositions: number[]
}

export function computeLayout(node: any): NodeLayout {
  if (!node.reportees?.length) {
    return {
      subtreeWidth: CARD_WIDTH,
      childLayouts: [],
      stemX: CARD_WIDTH / 2,
      barStart: 0,
      barEnd: 0,
      dropPositions: [],
    }
  }

  const childLayouts: NodeLayout[] = node.reportees.map(computeLayout)
  const dropPositions: number[] = []
  let offset = 0

  for (const cl of childLayouts) {
    dropPositions.push(offset + cl.subtreeWidth / 2)
    offset += cl.subtreeWidth + GAP
  }

  const childrenWidth = offset - GAP
  const subtreeWidth = Math.max(childrenWidth, CARD_WIDTH)

  return {
    subtreeWidth,
    childLayouts,
    stemX: subtreeWidth / 2,
    barStart: dropPositions[0] ?? 0,
    barEnd: dropPositions[dropPositions.length - 1] ?? 0,
    dropPositions,
  }
}
