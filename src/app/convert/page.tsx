'use client'

import { useApp } from '@/app-provider'
import { CalendarTable } from '@/components/calendar-table'
import { Button } from '@/components/ui/button'
import { getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { calendarToCsv, downloadFile } from '@/lib/export'
import { DownloadIcon } from 'lucide-react'
import { TableCalendarType } from '@/types/calendar'
import { redirect } from 'next/navigation'
import Loading from '@/components/loading'

export default function ConvertPage() {
  const { accounts } = useApp()

  const vluAccount = accounts.find((account) => account.provider == 'vanLang')

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const currentYear = new Date().getFullYear()

  const [termId, setTermId] = useState<string>(getCurrentTermID())
  const [yearStudy, setYearStudy] = useState<string>(getCurrentYearStudy())
  const [lichType, setLichType] = useState<string>('lichHoc')

  const [calendar, setCalendar] = useState<TableCalendarType[] | undefined>(undefined)

  const CalendarTableMemoized = React.memo(CalendarTable)

  // redirect to home if no accounts
  useEffect(() => {
    if (!vluAccount) {
      toast.error('Vui lòng thêm tài khoản VLU')

      setTimeout(() => {
        redirect('/settings')
      }, 1500)
    }
  }, [vluAccount])

  const refreshUserCookie = useCallback(async () => {
    const response = await fetch(`/api/accounts/vlu/cookie`, { method: 'POST', body: JSON.stringify({ accountId: vluAccount?.id }) })

    if (!response.ok) {
      toast.error('Có lỗi xảy ra khi cập nhật cookie')
      return
    }

    return await response.json()
  }, [vluAccount?.id])

  const maxAttemp = 3

  // fetch calendar
  const getCalendar = useCallback(
    async (cookie: string, attemp: number) => {
      setCalendar(undefined)
      setIsLoading(true)
      const response = await fetch(`/api/calendars?termId=${termId}&yearStudy=${yearStudy}&lichType=${lichType}&userId=${vluAccount?.userId}&cookie=${cookie}`, { method: 'GET' })

      if (response.status == 401) {
        toast.error('Cookie đã hết hạn, đang cập nhật lại...')
        if (attemp >= maxAttemp) {
          toast.error('Có lỗi xảy ra khi cập nhật cookie')
          setIsLoading(false)
          return
        }
        return getCalendar(await refreshUserCookie(), attemp + 1)
      }
      setIsLoading(false)
      return await response.json()
    },
    [lichType, refreshUserCookie, termId, vluAccount?.userId, yearStudy],
  )

  useEffect(() => {
    async function fetchData() {
      if (!vluAccount) return

      const calendar = await getCalendar(vluAccount.access_token as string, 1)
      setCalendar(calendar.details)
    }

    fetchData()
  }, [getCalendar, vluAccount, vluAccount?.access_token])

  return (
    <div className="flex container mx-auto py-10 flex-col items-center">
      <div className="flex justify-between w-full container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Thời khóa biểu</h1>

        <div className="flex gap-4 mb-4">
          <select value={lichType} onChange={(e) => setLichType(e.target.value)} className="border p-2 rounded">
            <option value="lichHoc">Lịch học</option>
            <option value="lichThi">Lịch thi</option>
          </select>

          <select value={termId} onChange={(e) => setTermId(e.target.value)} className="border p-2 rounded">
            <option value="HK01">Học kỳ 1</option>
            <option value="HK02">Học kỳ 2</option>
            <option value="HK03">Học kỳ 3</option>
          </select>

          <select value={yearStudy} onChange={(e) => setYearStudy(e.target.value)} className="border p-2 rounded">
            <option value={getCurrentYearStudy(currentYear - 3)}>{getCurrentYearStudy(currentYear - 3)}</option>
            <option value={getCurrentYearStudy(currentYear - 2)}>{getCurrentYearStudy(currentYear - 2)}</option>
            <option value={getCurrentYearStudy(currentYear - 1)}>{getCurrentYearStudy(currentYear - 1)}</option>
            <option value={getCurrentYearStudy(currentYear)}>{getCurrentYearStudy(currentYear)}</option>
            <option value={getCurrentYearStudy(currentYear + 1)}>{getCurrentYearStudy(currentYear + 1)}</option>
            <option value={getCurrentYearStudy(currentYear + 2)}>{getCurrentYearStudy(currentYear + 2)}</option>
            <option value={getCurrentYearStudy(currentYear + 3)}>{getCurrentYearStudy(currentYear + 3)}</option>
          </select>
        </div>
      </div>
      {isLoading && <Loading />}
      {calendar && <CalendarTableMemoized calendar={calendar} />}
      {calendar && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              downloadFile(calendarToCsv(calendar, yearStudy), 'calendar.csv', 'text/csv')
            }}
          >
            <DownloadIcon /> Tải lịch .csv
          </Button>
        </div>
      )}
    </div>
  )
}
