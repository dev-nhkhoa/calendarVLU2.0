'use client'

import { CalendarTable } from '@/components/calendar-table'
import { Button } from '@/components/ui/button'
import { calendar2Csv, getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { DownloadIcon } from 'lucide-react'
import { CalendarType } from '@/types/calendar'
import Loading from '@/components/loading'
import { downloadFile } from '@/lib/utils'
import { useApp } from '@/app-provider'
import { redirect } from 'next/navigation'

export default function ConvertPage() {
  const { vluAccount, setVluAccount } = useApp()

  useEffect(() => {
    if (!vluAccount) redirect('/')
  }, [vluAccount])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const currentYear = new Date().getFullYear()

  const [termId, setTermId] = useState<string>(getCurrentTermID())
  const [yearStudy, setYearStudy] = useState<string>(getCurrentYearStudy())
  const [lichType, setLichType] = useState<string>('lichHoc')

  const [isSyncing, setIsSyncing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'init' | 'creating-calendar' | 'creating-events'>('init')

  const [calendar, setCalendar] = useState<CalendarType[] | undefined>(undefined)

  const CalendarTableMemoized = React.memo(CalendarTable)

  async function sync2GoogleCalendar() {
    setIsSyncing(true)
    setCurrentStep('creating-calendar')

    try {
      // Step 1: Tạo calendar mới
      const calendarName = lichType === 'lichHoc' ? `Lịch Học-${termId}-${yearStudy}` : `Lịch Thi-${termId}-${yearStudy}`

      const calendarResponse = await fetch('/api/google/calendars', {
        method: 'POST',
        body: JSON.stringify({ calendarName }),
      })

      if (!calendarResponse.ok) {
        throw new Error(await calendarResponse.text())
      }

      const createdCalendar = await calendarResponse.json()
      toast.success(`Đã tạo calendar "${calendarName}"`)

      toast.info('Đang tạo sự kiện, có thể mất vài phút...', { autoClose: false })

      // Step 2: Tạo các events theo từng tuần
      setCurrentStep('creating-events')
      const events: unknown[] = []

      for (const subject of calendar || []) {
        const { summary, description, location, endTime, startDate, startTime } = subject

        try {
          // Định dạng sang ISO 8601
          const [day, month, year] = startDate.split('/').map(Number)
          const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

          events.push({
            calendarId: createdCalendar.id,
            summary: summary || 'Không có tiêu đề',
            location: location || 'Chưa xác định',
            description: description || 'Không có mô tả',
            start: {
              dateTime: `${isoDate}T${startTime}+07:00`,
              timeZone: 'Asia/Ho_Chi_Minh',
            },
            end: {
              dateTime: `${isoDate}T${endTime}+07:00`,
              timeZone: 'Asia/Ho_Chi_Minh',
            },
          })
        } catch (error) {
          console.error(`Lỗi khi xử lý`, error)
        }
      }

      // Step 3: Gửi yêu cầu tạo events
      const eventsResponse = await fetch('/api/google/calendars/events', {
        method: 'POST',
        body: JSON.stringify({ events }),
      })

      const result = await eventsResponse.json()

      if (!eventsResponse.ok) {
        throw new Error(result.error || 'Lỗi không xác định')
      }

      // Xử lý kết quả
      const successCount = result.successfulEvents?.length || 0
      const errorCount = result.failedEvents?.length || 0

      if (errorCount > 0) {
        toast.success(`Thành công ${successCount} sự kiện, thất bại ${errorCount}`, { autoClose: false })
      } else {
        toast.success(`Đã tạo thành công ${successCount} sự kiện`, { autoClose: false })
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Lỗi đồng bộ')
    } finally {
      setIsSyncing(false)
      setCurrentStep('init')
    }
  }
  const getButtonText = () => {
    switch (currentStep) {
      case 'creating-calendar':
        return 'Đang tạo calendar...'
      case 'creating-events':
        return `Đang tạo sự kiện...`
      default:
        return 'Đồng bộ với Google Calendar'
    }
  }

  const refreshUserCookie = useCallback(async () => {
    const response = await fetch(`/api/accounts/vlu/cookie`, { method: 'POST', body: JSON.stringify({ id: vluAccount?.id, password: vluAccount?.password }) })

    if (!response.ok) {
      toast.error('Có lỗi xảy ra khi cập nhật cookie')
      console.error('Failed to refresh cookie:', await response.text())
      return
    }

    setVluAccount({ id: vluAccount?.id as string, password: vluAccount?.password as string, cookie: await response.json() })
  }, [vluAccount, setVluAccount])

  const maxAttemp = 2

  // fetch calendar
  const getCalendar = useCallback(
    async (cookie: string, attemp: number) => {
      try {
        setCalendar(undefined)
        setIsLoading(true)

        const response = await fetch(`/api/calendars?termId=${termId}&yearStudy=${yearStudy}&lichType=${lichType}&cookie=${cookie}`, { method: 'GET' })

        const data = await response.json()

        if (response.ok) {
          setIsLoading(false)
          toast.success('Đã lấy lịch thành công!')
          return data
        }
        //TODO: tối ưu hiển thị toast (toast đang hiển thị sai)
        if (response.status == 401) {
          if (attemp >= maxAttemp) {
            toast.error('Có lỗi xảy ra khi cập nhật cookie', { autoClose: false })
            setIsLoading(false)
            return
          }
          toast.error('Cookie đã hết hạn, đang cập nhật lại...')
          await refreshUserCookie()
          return getCalendar(vluAccount?.cookie as string, attemp + 1)
        }
      } catch (error) {
        console.error('Failed to fetch calendar:', error)
        toast.error('Có lỗi xảy ra khi lấy lịch')
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lichType, termId, yearStudy, vluAccount],
  )

  useEffect(() => {
    async function fetchData() {
      if (!vluAccount) return

      const calendar = await getCalendar(vluAccount.cookie as string, 1)
      setCalendar(calendar)
    }

    fetchData()
  }, [getCalendar, vluAccount])

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
      {calendar && (
        <div className="flex justify-between gap-4 mb-4">
          <Button
            onClick={() => {
              if (lichType == 'lichHoc') {
                downloadFile(calendar2Csv(calendar), `lichHoc-${termId}-${yearStudy}.csv`, 'text/csv')
              } else {
                downloadFile(calendar2Csv(calendar), `lichThi-${termId}-${yearStudy}.csv`, 'text/csv')
              }
            }}
          >
            <DownloadIcon /> Tải lịch .csv
          </Button>
          <Button onClick={sync2GoogleCalendar} disabled={isSyncing}>
            {isSyncing && <Loading />}
            {getButtonText()}
          </Button>
        </div>
      )}
      {calendar && <CalendarTableMemoized calendar={calendar} lichType={lichType} />}
    </div>
  )
}
