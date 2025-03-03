'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight, Check } from 'lucide-react'
import Footer from '@/components/footer'
import HeaderPage from '@/components/header'
import Image from 'next/image'

import SecureVLU from '~/public/idea-images/secure-vlu-information.jpg'
import FetchInformationProcess from '~/public/idea-images/fetch-information-process.jpg'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderPage />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="space-y-2 px-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">Đồng bộ lịch VLU dễ dàng</h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Đồng bộ lịch học và lịch thi của bạn từ hệ thống VLU với Google Calendar, Outlook, và nhiều ứng dụng lịch khác.
              </p>
            </div>
            <div className="space-x-4 mt-4">
              <Button asChild>
                <Link href="#get-started">
                  Đồng bộ ngay! <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#how-it-works">Cách thức hoạt động</Link>
              </Button>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Các tính năng chính</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Xuất lịch dạng .csv</h3>
                <p className="text-gray-500 dark:text-gray-400">Xuất lịch học & lịch thi của bạn theo định dạng .csv để có thể dễ dàng import vào các ứng dụng lịch khác.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Check className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Đồng bộ Google Calendar</h3>
                <p className="text-gray-500 dark:text-gray-400">Đồng bộ lịch học & lịch thi của bạn chỉ với một phím nhấn.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <ArrowRight className="h-12 w-12 text-primary" />
                <div className="text-xl font-bold">
                  Tự động phát hiện thay đổi <p className="text-red-400">(Đang phát triển)</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Tự động cập nhật và thông báo các thay đổi về lịch học & lịch thi của bạn.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">Cách thức hoạt động</h2>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 container w-full">
                <h3 className="text-xl font-bold">Bảo mật tài khoản VLU của bạn</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Chúng tôi không can thiệp đến việc lưu trữ tài khoản VLU của bạn. Thông tin tài khoản sẽ được lưu trữ trên{' '}
                  <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" className="text-blue-500 underline" target="_blank">
                    LocalStorage
                  </Link>{' '}
                  của trình duyệt.
                </p>
                <Image src={SecureVLU} alt="Bảo mật thông tin tài khoản VLU" />
              </div>
              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 container w-full">
                <span className="text-3xl font-bold text-primary">2</span>
                <h3 className="text-xl font-bold">Lấy lịch học & lịch thi</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Sử dụng cookie của trang{' '}
                  <Link href="https://online.vlu.edu.vn" target="_blank" className="text-blue-500 underline">
                    online.vlu.edu.vn
                  </Link>
                  để lấy thông tin lịch học & lịch thi và format lại theo chuẩn định dạng để dễ dàng đồng bộ vào các ứng dụng lịch khác.
                </p>
                <Image src={FetchInformationProcess} alt="Quy trình lấy thông tin lịch học & lịch thi" />
              </div>
            </div>
          </div>
        </section>
        <section id="get-started" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Sẵn sàng để đồng bộ lịch của bạn?</h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">Bắt đầu chuyển lịch học & lịch thi VLU của bạn sang các ứng dụng lịch khác để quản lý dễ dàng.</p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/convert">Đồng bộ lịch ngay!</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
