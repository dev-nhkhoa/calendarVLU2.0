import { parseVluCalendar } from '../calendar-parser'

function buildRow(cells: string[]) {
  return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
}

describe('parseVluCalendar', () => {
  it('parses a study calendar row into normalized events', () => {
    const html = `<table><tbody>${buildRow(['', '', 'Lap Trinh Web', '', '', 'Hai', '1 - 2', 'A101', 'Nguyen Van A', '1, 2', ''])}</tbody></table>`

    const events = parseVluCalendar(html, '2025-2026', 'lichHoc')

    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({
      source: 'vlu',
      type: 'study',
      summary: 'Lap Trinh Web',
      location: 'A101',
      startDate: '08/09/2025',
      endDate: '08/09/2025',
      startTime: '07:00:00',
      endTime: '08:40:00',
      timezone: 'Asia/Ho_Chi_Minh',
    })
    expect(events[1].startDate).toBe('15/09/2025')
  })

  it('parses an exam calendar row into a normalized event', () => {
    const html = `<table><tbody>${buildRow(['', 'Ca 1', 'Toan Roi Rac', '', 'Thi tap trung', '20/12/2025', '7g30', 'B201', '', '', 'Ghi chu'])}</tbody></table>`

    const events = parseVluCalendar(html, '2025-2026', 'lichThi')

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      source: 'vlu',
      type: 'exam',
      summary: 'Toan Roi Rac',
      location: 'B201',
      startDate: '20/12/2025',
      endDate: '20/12/2025',
      startTime: '7:30:00',
      endTime: '7:30:00',
      description: 'Thi tap trung - Ca 1 - Ghi chu',
    })
  })
})
