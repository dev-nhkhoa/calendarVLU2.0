'use client'

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, type SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

interface Schedule {
  id: string
  name: string
  date: string
  time: string
  location: string
  teacher: string
  weeks: number[]
}

const columns: ColumnDef<Schedule>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Subject
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Day
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'time',
    header: 'Time',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'teacher',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Teacher
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'weeks',
    header: 'Weeks',
    cell: ({ row }) => {
      const weeks = row.getValue('weeks') as number[]
      return <span>{weeks.join(', ')}</span>
    },
  },
]

const scheduleData = Object.values({
  '1': {
    id: '242_71ITIS30603_01',
    name: 'Chuyên đề Tối ưu hóa máy tìm kiếm',
    date: 'Hai',
    time: '4 - 6',
    location: 'CS3.F.10.01',
    teacher: 'Hà Đồng Hưng',
    weeks: [18, 19, 20, 24, 25, 26, 27, 28, 29, 30],
  },
  '2': {
    id: '242_71ISDT40303_01',
    name: 'Hệ quản trị CSDL nâng cao',
    date: 'Hai',
    time: '7 - 9',
    location: 'CS3.F.04.02',
    teacher: 'Ngô Quốc Huy',
    weeks: [18, 19, 20, 24, 25, 26, 27, 28, 29, 30],
  },
  // ... rest of the data
}).map((item) => ({
  ...item,
  weeks: item.weeks || [],
}))

export function ScheduleTable() {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: scheduleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
