'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Shield, Download, Chrome, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react'
import Footer from '@/components/footer'
import HeaderPage from '@/components/header'

const faqData = [
  {
    q: 'Calendar VLU có lưu trữ mật khẩu VLU của tôi không?',
    a: 'Không. Calendar VLU không bao giờ yêu cầu hoặc lưu trữ mật khẩu VLU của bạn. Bạn đăng nhập trực tiếp vào website chính thức của VLU, và tiện ích Chrome chỉ đọc cookie phiên làm việc (session cookie) tạm thời để gửi yêu cầu một lần đến máy chủ. Chi tiết có trong Chính sách Bảo mật của chúng tôi.',
  },
  {
    q: 'Cookie VLU của tôi được xử lý như thế nào?',
    a: 'Cookie phiên VLU chỉ được sử dụng cho một yêu cầu API duy nhất (fetch lịch học/lịch thi) và không được lưu trữ trên máy chủ của chúng tôi. Cookie không được ghi vào log, không được chia sẻ với bên thứ ba, và không được sử dụng cho bất kỳ mục đích nào khác ngoài việc lấy dữ liệu lịch.',
  },
  {
    q: 'Dữ liệu Google Calendar của tôi có được bảo vệ không?',
    a: 'Có. Việc đồng bộ với Google Calendar sử dụng OAuth 2.0 — bạn cấp quyền cụ thể, có thể thu hồi bất kỳ lúc nào qua trang quản lý tài khoản Google của bạn. Chúng tôi chỉ tạo/sửa sự kiện lịch theo yêu cầu của bạn và không đọc lịch cá nhân khác.',
  },
  {
    q: 'Calendar VLU sử dụng cookie cho mục đích gì?',
    a: 'Website này chỉ sử dụng cookie phiên kỹ thuật cần thiết cho hoạt động của ứng dụng (ví dụ: cookie xác thực session). Chúng tôi không sử dụng cookie theo dõi quảng cáo hoặc cookie của bên thứ ba. Xem Chính sách Bảo mật để biết thêm chi tiết.',
  },
  {
    q: 'Dữ liệu của tôi được giữ trong bao lâu?',
    a: 'Dữ liệu lịch được xử lý theo thời gian thực và không được lưu trữ trên máy chủ của chúng tôi. Dữ liệu tài khoản Google (OAuth tokens) chỉ được lưu trữ để phục vụ đồng bộ và có thể bị xóa bất kỳ lúc qua trang cài đặt. Vui lòng xem Chính sách Bảo mật để biết thông tin đầy đủ.',
  },
  {
    q: 'Tiện ích Chrome đã được công bố chưa?',
    a: 'Tiện ích Chrome đang trong quá trình phát triển và chưa được công bố trên Chrome Web Store. Bạn có thể đăng ký nhận thông báo hoặc theo dõi repository GitHub để biết khi nào tiện ích sẵn sàng.',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Calendar VLU',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Chrome OS, macOS, Windows',
      description:
        'Đồng bộ lịch học và lịch thi VLU với Google Calendar qua tiện ích Chrome. An toàn, không cần nhập mật khẩu VLU.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@type': 'Person',
        name: 'Calendar VLU',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqData.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'Cách đồng bộ lịch VLU với Google Calendar',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Đăng nhập VLU',
          text: 'Đăng nhập vào online.vlu.edu.vn bằng tài khoản VLU chính thức của bạn.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Mở tiện ích Chrome',
          text: 'Nhấn vào biểu tượng Calendar VLU trên thanh tiện ích Chrome.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Đồng bộ lịch',
          text: 'Chọn lịch học hoặc lịch thi và đồng bộ với Google Calendar.',
        },
      ],
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeaderPage />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium bg-primary/5 text-primary mb-6">
              <Shield className="h-4 w-4" />
              Bảo mật hơn với mô hình tiện ích Chrome
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Đồng bộ lịch VLU với Google Calendar{' '}
              <span className="text-primary">an toàn hơn</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
              Không cần nhập mật khẩu VLU vào website bên thứ ba. Tiện ích Chrome đọc cookie từ phiên đăng nhập VLU hiện tại của bạn — an toàn, minh bạch, và tôn trọng quyền riêng tư.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="#install">
                  <Chrome className="mr-2 h-5 w-5" />
                  Cài đặt tiện ích Chrome
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">
                  Cách thức hoạt động <ChevronDown className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Extension Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tại sao tiện ích Chrome an toàn hơn?
              </h2>
              <p className="text-muted-foreground md:text-lg mt-4 max-w-2xl mx-auto">
                Không giống các website yêu cầu bạn nhập trực tiếp username và password VLU, tiện ích Chrome hoạt động với phiên đăng nhập hiện tại.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-background">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Không lưu mật khẩu</h3>
                <p className="text-muted-foreground">
                  Bạn đăng nhập trực tiếp trên website chính thức của VLU. Ứng dụng của chúng tôi không bao giờ thấy hoặc lưu trữ mật khẩu của bạn.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-background">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Cookie tạm thời</h3>
                <p className="text-muted-foreground">
                  Cookie phiên chỉ được dùng cho đúng một yêu cầu API để lấy lịch. Không lưu trữ, không ghi log, không chia sẻ.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-background">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Kiểm soát dữ liệu</h3>
                <p className="text-muted-foreground">
                  Bạn chủ động nhấn để đồng bộ. Dữ liệu lịch có thể xuất .csv hoặc đồng bộ Google Calendar theo lựa chọn của bạn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Cách thức hoạt động
            </h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Đăng nhập vào VLU</h3>
                  <p className="text-muted-foreground">
                    Đăng nhập vào <Link href="https://online.vlu.edu.vn" target="_blank" className="text-primary underline underline-offset-4">online.vlu.edu.vn</Link> như bình thường.
                    Thông tin đăng nhập của bạn chỉ nằm trên website chính thức của trường.
                    <ExternalLink className="inline h-4 w-4 ml-1" />
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Mở tiện ích Chrome</h3>
                  <p className="text-muted-foreground">
                    Nhấn vào biểu tượng Calendar VLU trên thanh tiện ích Chrome. Tiện ích sẽ tự động phát hiện phiên đăng nhập VLU của bạn.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Đồng bộ lịch</h3>
                  <p className="text-muted-foreground">
                    Chọn lịch học hoặc lịch thi và đồng bộ với Google Calendar hoặc tải xuống dưới dạng file CSV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Install / CTA Section */}
        <section id="install" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <Chrome className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Cài đặt tiện ích Chrome
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl mb-8">
              Tiện ích hiện đang trong giai đoạn phát triển. Đăng ký để nhận thông báo khi tiện ích sẵn sàng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" disabled>
                <Chrome className="mr-2 h-5 w-5" />
                Cài đặt từ Chrome Web Store
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="https://github.com/nhkhoa/calendarVLU" target="_blank">
                  Theo dõi trên GitHub
                </Link>
              </Button>
            </div>
            <p className="text-primary-foreground/70 text-sm mt-4">
              Tiện ích chưa được công bố — bạn sẽ được thông báo qua email khi có bản cập nhật.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tính năng</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-background">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Xuất file .csv</h3>
                <p className="text-muted-foreground">Xuất lịch học và lịch thi sang định dạng .csv để import vào bất kỳ ứng dụng lịch nào.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-background">
                <Download className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Đồng bộ Google Calendar</h3>
                <p className="text-muted-foreground">Đồng bộ trực tiếp lên Google Calendar chỉ với một cú nhấn chuột.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-background">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Bảo mật</h3>
                <p className="text-muted-foreground">Không lưu mật khẩu, không theo dõi, cookie tạm thời dùng một lần.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - AEO ready */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Câu trả lời trực tiếp cho những câu hỏi phổ biến nhất về bảo mật và quyền riêng tư.
            </p>
            <div className="space-y-4">
              {faqData.map((item, i) => (
                <details key={i} className="group border rounded-lg [&_summary]:open:font-semibold">
                  <summary className="flex cursor-pointer items-center justify-between p-4 text-left text-base hover:bg-muted/50 rounded-lg">
                    <span>{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed border-t pt-3 mt-0">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Sẵn sàng đồng bộ lịch VLU?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl mb-8">
              Không cần mạo hiểm nhập mật khẩu trên website lạ. Sử dụng tiện ích Chrome an toàn, minh bạch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="#install">
                  <Chrome className="mr-2 h-5 w-5" />
                  Cài đặt tiện ích
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#faq">
                  Xem FAQ
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
