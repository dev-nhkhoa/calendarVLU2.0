'use client'

import { useApp } from '@/app-provider'
import AddVLUAccountDialog from '@/components/add-vlu-account-dialog'
import { CalendarTable } from '@/components/calendar-table'
import { Button } from '@/components/ui/button'
import { getCurrentTermID, getCurrentYearStudy, TermID } from '@/lib/calendar'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import Loading from '@/components/loading'
import { calendarToCsv, downloadFile } from '@/lib/export'
import { DownloadIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { TableCalendarType } from '@/types/calendar'

export default function ConvertPage() {
  const { accounts } = useApp()

  const currentYear = new Date().getFullYear()
  const currentLichType = 'lichHoc'
  const currentYearStudy = useMemo(() => getCurrentYearStudy(), [])
  const currentTermID = useMemo(() => getCurrentTermID(), [])

  const [termId, setTermId] = useState<string>(currentTermID)
  const [yearStudy, setYearStudy] = useState<string>(currentYearStudy)
  const [lichType, setLichType] = useState<string>(currentLichType)

  const [calendar, setCalendar] = useState<TableCalendarType[] | undefined>(undefined)

  const [addAccount, setAddAccount] = useState(false) // State để mở dialog thêm tài khoản
  const [isLoading, setIsLoading] = useState(false) // Thêm state isLoading

  const vluAccount = accounts.find((account) => account.provider === 'vanLang')

  if (!vluAccount) {
    toast.error('Vui lòng liên kết tài khoản VLU để xem thời khóa biểu!')
    redirect('/settings')
  }

  const getCalendar = useCallback(async (currentCookie: string, userId: string, yearStudy: string, termId: string, lichType: string) => {
    return await fetch(`/api/calendars?cookie=${currentCookie}&userId=${userId}&yearStudy=${yearStudy}&termId=${termId}&lichType=${lichType}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  }, [])

  const handleRefreshCookie = useCallback(async () => {
    try {
      const response = await fetch('/api/accounts/vlu/cookie', {
        method: 'POST',
        body: JSON.stringify({ accountId: vluAccount?.id }),
      })

      if (!response.ok) throw new Error('Không thể làm mới cookie')

      const cookie = await response.json()

      return cookie
    } catch (error) {
      toast.error('Lỗi làm mới phiên đăng nhập: ' + error)
      return null
    }
  }, [vluAccount?.id])

  const MAX_RETRY = 3 // Số lần thử lại tối đa

  // Logic: Call API về server để lấy lịch học, nếu cookie account đã hết hạn thì sẽ call API để update cookie mới cho account và thử lại để lấy lịch.
  const handleFetchSchedule = useCallback(
    async (currentCookie: string, retryCount = 0, yearStudy = currentYearStudy, termId = currentTermID, lichType = currentLichType) => {
      if (!vluAccount || retryCount > MAX_RETRY) {
        setIsLoading(false)
        return
      }

      if (retryCount == MAX_RETRY) {
        toast.error('Đã thử quá số lần cho phép, không thể tải lịch!')
        return
      }

      setIsLoading(true)

      try {
        // Thực hiện request lấy lịch
        const response = await getCalendar(currentCookie, vluAccount.userId, yearStudy, termId, lichType)

        // Xử lý trường hợp cookie hết hạn

        if (response.status == 401) {
          const newCookie = await handleRefreshCookie()

          if (newCookie) {
            // Thử lại với cookie mới
            return handleFetchSchedule(newCookie, retryCount + 1)
          }
          return
        }

        // Xử lý lỗi HTTP
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        // Xử lý dữ liệu thành công
        const data = await response.json()
        setCalendar(data.details)
      } catch (error) {
        if (error) {
          toast.error(`Lỗi khi tải lịch: ${error}`)
          return
        }

        // Tự động thử lại sau 2s nếu còn lượt
        if (retryCount < MAX_RETRY) {
          setTimeout(() => {
            handleFetchSchedule(currentCookie, retryCount + 1)
          }, 1000)
        }
      } finally {
        setIsLoading(false) // Kết thúc tất cả lần thử, tắt loading
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTermID, currentYearStudy, getCalendar, handleRefreshCookie],
  )

  const CalendarTableMemoized = React.memo(CalendarTable)

  useEffect(() => {
    // Kích hoạt fetch ban đầu
    if (vluAccount?.access_token) handleFetchSchedule(vluAccount.access_token)

    return () => {
      setCalendar(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vluAccount?.access_token, vluAccount?.userId, getCalendar, handleRefreshCookie])

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

          <Button
            className="h-full"
            onClick={() => {
              setCalendar(undefined)

              if (vluAccount?.access_token) {
                handleFetchSchedule(vluAccount.access_token, 0, yearStudy, termId as TermID, lichType)
              }
            }}
          >
            Lấy lịch
          </Button>
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
      {!vluAccount && <AddVLUAccountDialog open={addAccount} setOpen={setAddAccount} />}
    </div>
  )
}
