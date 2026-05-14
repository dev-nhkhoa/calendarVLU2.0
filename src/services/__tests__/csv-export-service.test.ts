import { calendar2Csv } from '../csv-export-service'

describe('calendar2Csv', () => {
  it('exports normalized calendar events with the expected columns', () => {
    const csv = calendar2Csv([
      {
        summary: 'Lap Trinh Web',
        description: 'A101 Nguyen Van A',
        location: 'A101',
        startDate: '08/09/2025',
        endDate: '08/09/2025',
        startTime: '07:00:00',
        endTime: '08:40:00',
      },
    ])

    expect(csv).toContain('"Subject","StartDate","StartTime","EndDate","EndTime","Location","Description"')
    expect(csv).toContain('"Lap Trinh Web","08/09/2025","07:00:00","08/09/2025","08:40:00","A101","A101 Nguyen Van A"')
  })
})
