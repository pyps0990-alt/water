import { describe, expect, it } from 'vitest'
import { capacity, paginate } from '../src/print/paginate'
import { computeTotals } from '../src/lib/quote'

describe('paginate', () => {
  it('fits a short quote on one page with footer', () => {
    const p = paginate(3)
    expect(p).toHaveLength(1)
    expect(p[0]).toMatchObject({ rowStart: 0, rowEnd: 3, isFirst: true, isLast: true })
  })
  it('covers every row exactly once, in order, for any length', () => {
    for (let n = 0; n <= 80; n++) {
      const pages = paginate(n)
      let next = 0
      for (const pg of pages) {
        expect(pg.rowStart).toBe(next)
        next = pg.rowEnd
        const cap = capacity(pg.isFirst, pg.isLast)
        expect(pg.rowEnd - pg.rowStart).toBeLessThanOrEqual(cap)
      }
      expect(next).toBe(n)
      expect(pages.at(-1)!.isLast).toBe(true)
    }
  })
  it('is deterministic', () => {
    expect(paginate(37)).toEqual(paginate(37))
  })
  it('moves the footer to a new page when the last page is full of rows', () => {
    const n = capacity(true, false) // exactly fills page 1 without footer
    const pages = paginate(n)
    expect(pages).toHaveLength(2)
    expect(pages[1].rowEnd - pages[1].rowStart).toBe(0)
  })
})

describe('computeTotals', () => {
  const items = [{ quantity: 1, unitPrice: 48000 }, { quantity: 3, unitPrice: 1250 }]
  it('no tax', () => {
    expect(computeTotals(items, false)).toEqual({ subtotal: 51750, discount: 0, taxAmount: 0, totalAmount: 51750 })
  })
  it('5% VAT after discount, rounded', () => {
    expect(computeTotals(items, true, 1750)).toEqual({ subtotal: 51750, discount: 1750, taxAmount: 2500, totalAmount: 52500 })
  })
  it('clamps discount', () => {
    expect(computeTotals(items, false, 999999).totalAmount).toBe(0)
    expect(computeTotals(items, false, -5).discount).toBe(0)
  })
})
