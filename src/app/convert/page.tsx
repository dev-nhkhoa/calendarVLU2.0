import { ScheduleTable } from '@/components/schedule-table'

export default function ConvertPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Class Schedule</h1>
      <ScheduleTable />
    </div>
  )
}
