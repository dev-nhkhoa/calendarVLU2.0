import { convertGTime, getExactDate, getMondayDate } from '../utils'

describe('calendar date utilities', () => {
  it('finds the first Monday for a study year and exact weekday date', () => {
    expect(getMondayDate('2025-2026', 1)).toEqual(['08/09/2025', '14/09/2025'])
    expect(getExactDate('08/09/2025', 'Tư')).toBe('10/09/2025')
  })

  it('converts VLU exam time text', () => {
    expect(convertGTime('7g30')).toBe('7:30:00')
  })
})
