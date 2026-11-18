import type { QuoteItem } from '../types/models'

export const VAT_RATE = 0.05

export interface QuoteTotals {
  subtotal: number
  discount: number
  taxAmount: number
  totalAmount: number
}

/** Subtotal − discount, plus 5% VAT when taxIncluded. All amounts in whole NTD. */
export function computeTotals(items: Pick<QuoteItem, 'quantity' | 'unitPrice'>[], taxIncluded: boolean, discount = 0): QuoteTotals {
  const subtotal = items.reduce((sum, it) => sum + Math.round(it.quantity * it.unitPrice), 0)
  const d = Math.min(Math.max(0, Math.round(discount)), subtotal)
  const taxable = subtotal - d
  const taxAmount = taxIncluded ? Math.round(taxable * VAT_RATE) : 0
  return { subtotal, discount: d, taxAmount, totalAmount: taxable + taxAmount }
}

export const ntd = (n: number) => `NT$ ${n.toLocaleString('zh-TW')}`
