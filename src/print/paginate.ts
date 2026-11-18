/**
 * Deterministic A4 pagination (all units mm). Every row has a fixed height,
 * so page breaks are identical on every browser and every reprint — which is
 * what makes the cross-page seal (騎縫章) positions reliable.
 */
export const LAYOUT = {
  pageHeight: 297,
  padding: 15,
  firstHeader: 68, // company header + quote meta + client block
  contHeader: 16, // running header on continuation pages
  tableHeader: 9,
  row: 12,
  footer: 112, // totals, terms, bank, warranty, notes, signatures
} as const

export interface PageSpec {
  index: number
  rowStart: number
  rowEnd: number // exclusive
  isFirst: boolean
  isLast: boolean
}

const usable = LAYOUT.pageHeight - LAYOUT.padding * 2

export function capacity(isFirst: boolean, withFooter: boolean): number {
  const used = (isFirst ? LAYOUT.firstHeader : LAYOUT.contHeader) + LAYOUT.tableHeader + (withFooter ? LAYOUT.footer : 0)
  return Math.max(0, Math.floor((usable - used) / LAYOUT.row))
}

export function paginate(rowCount: number): PageSpec[] {
  const pages: { start: number; end: number }[] = []
  let i = 0
  let first = true
  // Fill pages; the footer goes on the last page only if it fits beside its rows.
  while (true) {
    const remaining = rowCount - i
    if (remaining <= capacity(first, true)) {
      pages.push({ start: i, end: rowCount })
      break
    }
    const take = Math.min(remaining, capacity(first, false))
    pages.push({ start: i, end: i + take })
    i += take
    first = false
    if (i >= rowCount) {
      pages.push({ start: i, end: i }) // footer-only page
      break
    }
  }
  return pages.map((p, k) => ({ index: k, rowStart: p.start, rowEnd: p.end, isFirst: k === 0, isLast: k === pages.length - 1 }))
}
