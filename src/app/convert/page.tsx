'use client'

import { CalendarTable } from '@/components/calendar-table'
import { Button } from '@/components/ui/button'
import { calendar2Csv, getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { DownloadIcon, CalendarIcon, SearchIcon } from 'lucide-react'
import { CalendarType } from '@/types/calendar'
import Loading from '@/components/loading'
import { downloadFile } from '@/lib/utils'
import { useApp } from '@/app-provider'
import Link from 'next/link'

export default function ConvertPage() {
  const { vluAccount, setVluAccount } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [currentStep, setCurrentStep] = useState('init')
  const [calendar, setCalendar] = useState<CalendarType[] | undefined>(undefined)
  const initialLoadDone = useRef(false)

  // Form state
  const currentYear = new Date().getFullYear()
  const [formState, setFormState] = useState({
    termId: getCurrentTermID(),
    yearStudy: getCurrentYearStudy(),
    lichType: 'lichHoc',
  })

  const { termId, yearStudy, lichType } = formState

  // Memoize CalendarTable component
  const CalendarTableMemoized = React.memo(CalendarTable)

  // Check if user has linked VLU account
  useEffect(() => {
    if (!vluAccount) {
      toast.error('Vui lòng liên kết tài khoản VLU để sử dụng tính năng này', { autoClose: 3000 })
    } else if (!initialLoadDone.current) {
      // Tự động fetch lịch khi trang được tải lần đầu và người dùng đã liên kết tài khoản
      initialLoadDone.current = true
      fetchCalendar()
    }
  }, [vluAccount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  // Refresh user cookie
  const refreshUserCookie = useCallback(async () => {
    if (!vluAccount?.id || !vluAccount?.password) return false

    try {
      const response = await fetch(`/api/accounts/vlu/cookie`, {
        method: 'POST',
        body: JSON.stringify({ id: vluAccount.id, password: vluAccount.password }),
      })

      if (!response.ok) {
        toast.error('Có lỗi xảy ra khi cập nhật cookie')
        console.error('Failed to refresh cookie:', await response.text())
        return false
      }

      const newCookie = await response.json()
      setVluAccount({
        id: vluAccount.id,
        password: vluAccount.password,
        cookie: newCookie,
      })
      return true
    } catch (error) {
      console.error('Cookie refresh error:', error)
      toast.error('Lỗi kết nối khi cập nhật phiên đăng nhập')
      return false
    }
  }, [vluAccount, setVluAccount])

  // Fetch calendar data
  const fetchCalendar = useCallback(async () => {
    if (!vluAccount?.cookie) {
      toast.error('Không tìm thấy phiên đăng nhập')
      return
    }

    try {
      setCalendar(undefined)
      setIsLoading(true)

      const response = await fetch(`/api/calendars?termId=${termId}&yearStudy=${yearStudy}&lichType=${lichType}&cookie=${vluAccount.cookie}`, { method: 'GET' })

      const data = await response.json()

      if (response.ok) {
        setCalendar(data)
        setIsLoading(false)
        toast.success('Đã lấy lịch thành công!')
        return
      }

      // Handle expired cookie - try only once
      if (response.status === 401) {
        toast.warning('Phiên đăng nhập đã hết hạn, đang cập nhật lại...')

        const refreshSuccess = await refreshUserCookie()
        if (refreshSuccess && vluAccount?.cookie) {
          // Retry with new cookie - only once
          const retryResponse = await fetch(`/api/calendars?termId=${termId}&yearStudy=${yearStudy}&lichType=${lichType}&cookie=${vluAccount.cookie}`, { method: 'GET' })

          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            setCalendar(retryData)
            setIsLoading(false)
            toast.success('Đã lấy lịch thành công!')
            return
          } else {
            throw new Error('Không thể lấy lịch sau khi cập nhật phiên đăng nhập')
          }
        } else {
          throw new Error('Không thể cập nhật phiên đăng nhập')
        }
      }

      // Handle other errors
      throw new Error(data.message || 'Lỗi không xác định')
    } catch (error) {
      console.error('Calendar fetch error:', error)
      toast.error('Có lỗi xảy ra khi lấy lịch. Vui lòng thử lại sau.')
      setIsLoading(false)
    }
  }, [lichType, termId, yearStudy, refreshUserCookie, vluAccount])

  // Format event dates for Google Calendar
  const formatEventDate = (dateStr: string, timeStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number)
    const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return `${isoDate}T${timeStr}+07:00`
  }

  // Prepare events for Google Calendar
  const prepareCalendarEvents = (calendarId: string, calendarData: CalendarType[]) => {
    return calendarData
      .map((item) => {
        const { summary, description, location, endTime, startDate, startTime } = item

        try {
          return {
            calendarId,
            summary: summary || 'Không có tiêu đề',
            location: location || 'Chưa xác định',
            description: description || 'Không có mô tả',
            start: {
              dateTime: formatEventDate(startDate, startTime),
              timeZone: 'Asia/Ho_Chi_Minh',
            },
            end: {
              dateTime: formatEventDate(startDate, endTime),
              timeZone: 'Asia/Ho_Chi_Minh',
            },
          }
        } catch (error) {
          console.error('Event formatting error:', error)
          return null
        }
      })
      .filter(Boolean) // Remove any null entries
  }

  // Sync to Google Calendar
  const syncToGoogleCalendar = async () => {
    if (!calendar || calendar.length === 0) {
      toast.error('Không có dữ liệu lịch để đồng bộ')
      return
    }

    setIsSyncing(true)
    setCurrentStep('creating-calendar')

    try {
      // Step 1: Create new calendar
      const calendarName = `${lichType === 'lichHoc' ? 'Lịch Học' : 'Lịch Thi'}-${termId}-${yearStudy}`

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

      // Step 2: Create calendar events
      setCurrentStep('creating-events')
      const events = prepareCalendarEvents(createdCalendar.id, calendar)

      // Step 3: Send request to create events
      const eventsResponse = await fetch('/api/google/calendars/events', {
        method: 'POST',
        body: JSON.stringify({ events }),
      })

      const result = await eventsResponse.json()

      if (!eventsResponse.ok) {
        throw new Error(result.error || 'Lỗi không xác định')
      }

      // Handle results
      const successCount = result.successfulEvents?.length || 0
      const errorCount = result.failedEvents?.length || 0

      if (errorCount > 0) {
        toast.success(`Thành công ${successCount} sự kiện, thất bại ${errorCount}`, { autoClose: false })
      } else {
        toast.success(`Đã tạo thành công ${successCount} sự kiện`, { autoClose: false })
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Lỗi đồng bộ với Google Calendar')
    } finally {
      setIsSyncing(false)
      setCurrentStep('init')
    }
  }

  // Get sync button text based on current step
  const getSyncButtonText = () => {
    switch (currentStep) {
      case 'creating-calendar':
        return 'Đang tạo calendar...'
      case 'creating-events':
        return 'Đang tạo sự kiện...'
      default:
        return 'Đồng bộ với Google Calendar'
    }
  }

  // Handle CSV download
  const handleDownloadCsv = () => {
    if (!calendar) return

    const filename = `${lichType === 'lichHoc' ? 'lichHoc' : 'lichThi'}-${termId}-${yearStudy}.csv`
    downloadFile(calendar2Csv(calendar), filename, 'text/csv')
  }

  // Render login prompt if no VLU account
  if (!vluAccount) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <Button asChild>
          <Link href="/settings">Liên kết tài khoản VLU</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 w-full">Thời khóa biểu</h1>

      {/* Form controls - responsive layout */}
      <div className="w-full flex flex-col md:flex-row gap-3 mb-6">
        <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-3">
          <select name="lichType" value={lichType} onChange={handleInputChange} className="border rounded px-2 py-1 h-9 text-sm md:text-base">
            <option value="lichHoc">Lịch học</option>
            <option value="lichThi">Lịch thi</option>
          </select>

          <select name="termId" value={termId} onChange={handleInputChange} className="border rounded px-2 py-1 h-9 text-sm md:text-base">
            <option value="HK01">Học kỳ 1</option>
            <option value="HK02">Học kỳ 2</option>
            <option value="HK03">Học kỳ 3</option>
          </select>

          <select name="yearStudy" value={yearStudy} onChange={handleInputChange} className="border rounded px-2 py-1 h-9 text-sm md:text-base col-span-2 md:col-span-1">
            {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
              const yearValue = getCurrentYearStudy(currentYear + offset)
              return (
                <option key={yearValue} value={yearValue}>
                  {yearValue}
                </option>
              )
            })}
          </select>
        </div>

        <Button onClick={fetchCalendar} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 h-9 px-3 md:px-4 mt-2 md:mt-0 text-sm md:text-base">
          {isLoading ? <Loading /> : <SearchIcon className="mr-1 h-4 w-4" />}
          Tìm Lịch
        </Button>
      </div>

      {isLoading && (
        <div className="w-full flex justify-center my-8">
          <Loading />
        </div>
      )}

      {calendar && !isLoading && (
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6 w-full">
          <Button onClick={handleDownloadCsv} className="h-9 text-sm md:text-base">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Tải lịch .csv
          </Button>

          <Button onClick={syncToGoogleCalendar} disabled={isSyncing} className="h-9 text-sm md:text-base">
            {isSyncing ? <Loading /> : <CalendarIcon className="mr-2 h-4 w-4" />}
            {getSyncButtonText()}
          </Button>
        </div>
      )}

      {calendar && !isLoading && (
        <div className="w-full overflow-x-auto">
          <CalendarTableMemoized calendar={calendar} lichType={lichType} />
        </div>
      )}
    </div>
  )
}
