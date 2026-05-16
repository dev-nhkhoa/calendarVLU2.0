import Link from 'next/link'
import { ArrowRight, CalendarDays, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FooterPage from '@/components/footer'

const highlights = ['Quản lý việc học', 'Quản lý lịch thi', 'Google Calendar', 'CSV/iCal', 'VLU']

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-white text-black">
      <section className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-between px-6 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">CalendarVLU</p>
              <p className="text-xs text-black/60">Đưa lịch học/lịch thi của bạn lên Google Calendar</p>
            </div>
          </div>
        </header>

        <div className="py-14 lg:py-18">
          <div className="max-w-full">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-black/70">
              <Download className="h-4 w-4" />
              Dành cho sinh viên Văn Lang
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">CalendarVLU giúp đưa lịch học và lịch thi của bạn lên Google Calendar.</h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-black/65 sm:text-lg">
              Bạn đang tìm giải pháp để import lịch học/lịch thi của mình lên Google Calendar hoặc tải file CSV/iCal? Đây là giải pháp dành cho bạn.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <a href="/calendar-vlu-extension-v2.0.0.zip" download>
                  Tải xuống extension .zip
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-black/15 bg-transparent px-6" disabled>
                <span>
                  Chrome Web Store — Coming soon
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/70">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="border-t border-black/10 py-14">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Quy trình sử dụng CalendarVLU</h2>
            <p className="mt-3 text-sm text-black/60">Làm theo 4 bước dưới đây để dễ dàng đưa lịch học và lịch thi lên Google Calendar.</p>
          </div>
          
          <div className="mt-12 flex flex-col gap-16 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-bold">1</div>
                <h3 className="text-lg font-semibold">Tải & cài đặt extension</h3>
              </div>
              <p className="text-sm text-black/60">Tải file .zip và thêm tiện ích CalendarVLU vào trình duyệt Chrome.</p>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-black/10">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/JB0mVM-9jak?autoplay=1&mute=1&loop=1&playlist=JB0mVM-9jak"
                  title="Hướng dẫn tải extension"
                  loading="lazy"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-bold">2</div>
                <h3 className="text-lg font-semibold">Đăng nhập tài khoản Google</h3>
              </div>
              <p className="text-sm text-black/60">Cấp quyền để ứng dụng có thể tạo và quản lý sự kiện trên lịch của bạn.</p>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-black/10">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/haZW5KQPvv0?autoplay=1&mute=1&loop=1&playlist=haZW5KQPvv0"
                  title="Hướng dẫn đăng nhập google account"
                  loading="lazy"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-bold">3</div>
                <h3 className="text-lg font-semibold">Tạo lịch mới trên Calendar</h3>
              </div>
              <p className="text-sm text-black/60">Thiết lập một bộ lịch (Calendar) riêng tư để dễ dàng theo dõi việc học.</p>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-black/10">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/OKYN6DSIkuo?autoplay=1&mute=1&loop=1&playlist=OKYN6DSIkuo"
                  title="Hướng dẫn đăng ký lịch trên google calendar"
                  loading="lazy"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-bold">4</div>
                <h3 className="text-lg font-semibold">Đồng bộ lịch học VLU</h3>
              </div>
              <p className="text-sm text-black/60">Mở extension, lấy dữ liệu từ portal VLU và đẩy lên Google Calendar.</p>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-black/10">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/lv3Bpp0OcZo?autoplay=1&mute=1&loop=1&playlist=lv3Bpp0OcZo"
                  title="Hướng dẫn đồng bộ lịch học VLU lên Google Calendar"
                  loading="lazy"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 py-14">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bảo mật & quyền riêng tư</h2>
            <p className="mt-3 text-sm text-black/60">CalendarVLU được thiết kế để tôn trọng dữ liệu của bạn.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-black/10 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white text-sm font-bold">1</div>
              <h3 className="text-base font-semibold">Không lưu mật khẩu</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">Bạn đăng nhập trực tiếp vào website chính thức của VLU. CalendarVLU không bao giờ thấy hoặc lưu trữ mật khẩu của bạn.</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/10 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white text-sm font-bold">2</div>
              <h3 className="text-base font-semibold">Cookie tạm thời</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">Cookie phiên chỉ dùng cho một yêu cầu API duy nhất. Không lưu trữ, không ghi log, không chia sẻ.</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/10 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white text-sm font-bold">3</div>
              <h3 className="text-base font-semibold">OAuth 2.0</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">Kết nối với Google Calendar qua OAuth 2.0 — bạn cấp quyền cụ thể và có thể thu hồi bất kỳ lúc nào.</p>
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 py-14">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Câu hỏi thường gặp</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-black/10 p-6">
              <p className="text-sm text-black/50">CalendarVLU</p>
              <p className="mt-2 text-sm leading-6 text-black/70">CalendarVLU là công cụ giúp sinh viên Văn Lang import lịch học và lịch thi từ VLU sang Google Calendar.</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/10 p-6">
              <p className="text-sm text-black/50">Bảo mật</p>
              <p className="mt-2 text-sm leading-6 text-black/70">CalendarVLU không lưu mật khẩu hay dữ liệu cá nhân của bạn. Cookie phiên chỉ dùng một lần và không được ghi lại.</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/10 p-6">
              <p className="text-sm text-black/50">Nền tảng hỗ trợ</p>
              <p className="mt-2 text-sm leading-6 text-black/70">Hiện tại CalendarVLU hỗ trợ Google Calendar và xuất CSV/iCal. Bạn có thể dùng trực tiếp từ trình duyệt Chrome.</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/10 p-6">
              <p className="text-sm text-black/50">Chi phí</p>
              <p className="mt-2 text-sm leading-6 text-black/70">CalendarVLU là dự án mã nguồn mở, hoàn toàn miễn phí. Bạn có thể xem source code trên GitHub.</p>
            </div>
          </div>
        </section>

        <FooterPage />
      </section>
    </main>
  )
}
