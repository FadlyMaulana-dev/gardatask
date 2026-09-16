import { describe, it, expect } from 'vitest'
import { buildCashFlowPayload } from './CashFlow'

describe('cash flow payload builder', () => {
  it('normalizes an income payload for save and update actions', () => {
    const payload = buildCashFlowPayload({
      category: ' Gaji ',
      description: ' Gaji bulan September ',
      amount: '2500000',
      transaction_date: '2026-09-15',
      notes: ' ',
      type: 'income',
    })

    expect(payload).toEqual({
      category: 'Gaji',
      description: 'Gaji bulan September',
      amount: 2500000,
      transaction_date: '2026-09-15',
      notes: '',
      type: 'income',
    })
  })
})
