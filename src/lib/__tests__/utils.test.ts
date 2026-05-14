import { convertGTime, getExactDate, getMondayDate } from '../utils'

describe('calendar date utilities', () => {
  it('finds the first Monday for a study year and exact weekday date', () => {
    expect(getMondayDate('2025-2026', 1)).toEqual(['08/09/2025', '14/09/2025'])
    expect(getExactDate('08/09/2025', 'Tư')).toBe('10/09/2025')
  })

  it('converts VLU exam time text — g format', () => {
    expect(convertGTime('7g30')).toBe('7:30:00')
    expect(convertGTime('13g30')).toBe('13:30:00')
    expect(convertGTime('07g00')).toBe('07:00:00')
  })

  it('converts VLU exam time text — h format', () => {
    expect(convertGTime('7h30')).toBe('7:30:00')
    expect(convertGTime('7h00')).toBe('7:00:00')
    expect(convertGTime('13h30')).toBe('13:30:00')
  })

  it('converts VLU exam time text — colon and dot separators', () => {
    expect(convertGTime('7:30')).toBe('7:30:00')
    expect(convertGTime('7.30')).toBe('7:30:00')
    expect(convertGTime('13:30')).toBe('13:30:00')
  })

  it('converts VLU exam time text — hour-only', () => {
    expect(convertGTime('7g')).toBe('7:00:00')
    expect(convertGTime('7h')).toBe('7:00:00')
  })

  it('converts VLU exam time text — with phút suffix', () => {
    expect(convertGTime('7h30p')).toBe('7:30:00')
    expect(convertGTime('7g30p')).toBe('7:30:00')
  })
})
