import { describe, it, expect } from 'vitest'
import { createPlannerHistoryEntry } from './YearlyPlannerPage'

describe('planner history', () => {
  it('creates a history item for this month plan', () => {
    const entry = createPlannerHistoryEntry('thisMonthPlan', 'Target launching dashboard', 'Admin GardaTask')

    expect(entry.type).toBe('thisMonthPlan')
    expect(entry.label).toBe('Bulan Ini')
    expect(entry.content).toBe('Target launching dashboard')
    expect(entry.author).toBe('Admin GardaTask')
    expect(entry.createdAt).toBeTruthy()
  })

  it('creates a history item for next month agenda', () => {
    const entry = createPlannerHistoryEntry('nextMonthAgenda', 'Membuat roadmap marketing', 'Admin GardaTask')

    expect(entry.type).toBe('nextMonthAgenda')
    expect(entry.label).toBe('Bulan Depan')
    expect(entry.content).toBe('Membuat roadmap marketing')
  })
})
