'use client'

import { CalendarTable } from '@/components/calendar-table'
import { Button } from '@/components/ui/button'
import { calendar2Csv, getCurrentTermID, getCurrentYearStudy } from '@/lib/calendar'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { DownloadIcon, CalendarIcon, SearchIcon, Chrome } from 'lucide-react'
import { CalendarType } from '@/types/calendar'
import Loading from '@/components/loading'
import { downloadFile } from '@/lib/utils'
import { useApp } from '@/app-provider'
import Link from 'next/link'
import { prepareCalendarEvents } from '@/services/google-calendar-service'

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

  const CalendarTableMemoized = React.memo(CalendarTable)

  useEffect(() => {
    if (!vluAccount) {
      toast.error('Vui lòng liên kết tài khoản VLU để sử dụng tính năng này', { autoClose: 3000 })
    } else if (!initialLoadDone.current) {
      initialLoadDone.current = true
      fetchCalendar()
    }
  }, [vluAccount]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const refreshUserCookie = useCallback(async () => {
    if (!vluAccount?.id || !vluAccount?.password) return null

    try {
      const response = await fetch(`/api/accounts/vlu/cookie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: vluAccount.id, password: vluAccount.password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        toast.error('Có lỗi xảy ra khi cập nhật cookie')
        console.error('Failed to refresh cookie:', errorText)
        return null
      }

      const newCookie = await response.json()

      const updatedAccount = {
        id: vluAccount.id,
        password: vluAccount.password,
        cookie: newCookie,
      }

      setVluAccount(updatedAccount)
      return newCookie
    } catch (error) {
      console.error('Cookie refresh error:', error)
      toast.error('Lỗi kết nối khi cập nhật phiên đăng nhập')
      return null
    }
  }, [vluAccount, setVluAccount])

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

      if (response.status === 401) {
        toast.warning('Phiên đăng nhập đã hết hạn, đang cập nhật lại...')

        const newCookie = await refreshUserCookie()
        if (newCookie) {
          const retryResponse = await fetch(`/api/calendars?termId=${termId}&yearStudy=${yearStudy}&lichType=${lichType}&cookie=${newCookie}`, { method: 'GET' })

          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            setCalendar(retryData)
            setIsLoading(false)
            toast.success('Đã lấy lịch thành công!')
            return
          } else {
            const retryError = await retryResponse.json()
            throw new Error(`Không thể lấy lịch sau khi cập nhật phiên đăng nhập: ${retryError.error || 'Lỗi không xác định'}`)
          }
        } else {
          throw new Error('Không thể cập nhật phiên đăng nhập')
        }
      }

      throw new Error(data.message || 'Lỗi không xác định')
    } catch (error) {
      console.error('Calendar fetch error:', error)
      toast.error('Có lỗi xảy ra khi lấy lịch. Vui lòng thử lại sau.')
      setIsLoading(false)
    }
  }, [lichType, termId, yearStudy, refreshUserCookie, vluAccount])

  const syncToGoogleCalendar = async () => {
    if (!calendar || calendar.length === 0) {
      toast.error('Không có dữ liệu lịch để đồng bộ')
      return
    }

    setIsSyncing(true)
    setCurrentStep('creating-calendar')

    try {
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

      setCurrentStep('creating-events')
      const events = prepareCalendarEvents(createdCalendar.id, calendar)

      const eventsResponse = await fetch('/api/google/calendars/events', {
        method: 'POST',
        body: JSON.stringify({ events }),
      })

      const result = await eventsResponse.json()

      if (!eventsResponse.ok) {
        throw new Error(result.error || 'Lỗi không xác định')
      }

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

  const handleDownloadCsv = () => {
    if (!calendar) return
    const filename = `${lichType === 'lichHoc' ? 'lichHoc' : 'lichThi'}-${termId}-${yearStudy}.csv`
    downloadFile(calendar2Csv(calendar), filename, 'text/csv')
  }

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
      <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 mb-6">
        <p className="font-semibold flex items-center gap-2">
          <Chrome className="h-4 w-4" />
          Phương thức đồng bộ qua web sẽ bị loại bỏ
        </p>
        <p className="mt-1">
          Để bảo mật tốt hơn, vui lòng sử dụng{' '}
          <Link href="/#install" className="underline font-medium">
            tiện ích Chrome Calendar VLU
          </Link>{' '}
          để đồng bộ lịch mà không cần nhập mật khẩu. Trang này chỉ được giữ lại cho mục đích tương thích ngược.
        </p>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 w-full">Thời khóa biểu</h1>

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
