'use client'

import { useApp } from '@/app-provider'
import { CalendarTable } from '@/components/calendar-table'
import { Button } from '@/components/ui/button'
import { convertAMPMto24, getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { downloadFile, getExactDate, getMondayDate, lichHocToCsv, lichThiToCsv } from '@/lib/export'
import { DownloadIcon } from 'lucide-react'
import { TableCalendarType } from '@/types/calendar'
import { redirect } from 'next/navigation'
import Loading from '@/components/loading'
import { convertTime } from '@/constants/calendar'

export default function ConvertPage() {
  const { accounts } = useApp()

  const vluAccount = accounts.find((account) => account.provider == 'vanLang')

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const currentYear = new Date().getFullYear()

  const [termId, setTermId] = useState<string>(getCurrentTermID())
  const [yearStudy, setYearStudy] = useState<string>(getCurrentYearStudy())
  const [lichType, setLichType] = useState<string>('lichHoc')

  const [isSyncing, setIsSyncing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'init' | 'creating-calendar' | 'creating-events'>('init')

  const [calendar, setCalendar] = useState<TableCalendarType[] | undefined>(undefined)

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

      toast.info('Đang tạo sự kiện, có thể mất vài phút...')

      // Step 2: Tạo các events theo từng tuần
      setCurrentStep('creating-events')
      const events: unknown[] = []

      for (const subject of calendar || []) {
        const { summary, description, location, learningDate, learningTime, teacher, weeks } = subject

        // Validate required fields
        if (!learningDate || !learningTime || !weeks?.length) {
          console.warn('Missing required fields for subject:', subject)
          continue
        }

        // Lấy thông tin thời gian học
        const formatedTime = convertTime[learningTime]
        if (!formatedTime) {
          console.warn('Invalid learning time:', learningTime)
          continue
        }

        // Xử lý cho từng tuần
        for (const week of weeks) {
          try {
            // Lấy ngày thứ 2 của tuần
            const [mondayDate] = getMondayDate(yearStudy, Number(week))

            // Chuyển đổi thành ngày học cụ thể
            const exactDate = getExactDate(mondayDate, learningDate)

            // Định dạng sang ISO 8601
            const [day, month, year] = exactDate.split('/').map(Number)
            const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

            events.push({
              calendarId: createdCalendar.id,
              summary: summary || 'Không có tiêu đề',
              location: location || 'Chưa xác định',
              description: [description, `Giáo viên: ${teacher || 'Chưa cập nhật'}`, `Địa điểm: ${location || 'Chưa xác định'}`, `Tuần học: ${week}`].filter(Boolean).join('\n'),
              start: {
                dateTime: `${isoDate}T${convertAMPMto24(formatedTime[0])}+07:00`,
                timeZone: 'Asia/Ho_Chi_Minh',
              },
              end: {
                dateTime: `${isoDate}T${convertAMPMto24(formatedTime[1])}+07:00`,
                timeZone: 'Asia/Ho_Chi_Minh',
              },
            })
          } catch (error) {
            console.error(`Lỗi khi xử lý tuần ${week}:`, error)
          }
        }
      }

      // Step 3: Gửi yêu cầu tạo events
      const eventsResponse = await fetch('/api/google/calendars/events', {
        method: 'POST',
        body: JSON.stringify({ events }),
      })

      const result = await eventsResponse.json()

      console.log(result)

      if (!eventsResponse.ok) {
        throw new Error(result.error || 'Lỗi không xác định')
      }

      // Xử lý kết quả
      const successCount = result.successfulEvents?.length || 0
      const errorCount = result.failedEvents?.length || 0

      if (errorCount > 0) {
        toast.success(`Thành công ${successCount} sự kiện, thất bại ${errorCount}`)
      } else {
        toast.success(`Đã tạo thành công ${successCount} sự kiện`)
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

  console.log(convertAMPMto24(convertTime['10 - 12'][0]))

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
      {calendar && <CalendarTableMemoized calendar={calendar} lichType={lichType} />}
      {calendar && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              if (lichType == 'lichHoc') {
                downloadFile(lichHocToCsv(calendar, yearStudy), `lichHoc-${termId}-${yearStudy}.csv`, 'text/csv')
              } else {
                downloadFile(lichThiToCsv(calendar), `lichThi-${termId}-${yearStudy}.csv`, 'text/csv')
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
    </div>
  )
}
