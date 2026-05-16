import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-dvh bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:px-12">
        <header className="mb-10 flex items-center gap-3 border-b border-black/10 pb-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15">
              <CalendarDays className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">CalendarVLU</span>
          </Link>
        </header>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Chính sách bảo mật</h1>
        <p className="mt-2 text-sm text-black/50">Cập nhật lần cuối: Tháng 5 năm 2026</p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-black/75">
          <section>
            <h2 className="mb-3 text-base font-semibold text-black">1. Giới thiệu</h2>
            <p>
              CalendarVLU là công cụ giúp sinh viên trường Đại học Văn Lang (VLU) import lịch học và lịch thi từ cổng thông tin VLU lên Google Calendar.
              Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">2. Dữ liệu chúng tôi thu thập</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-black">Thông tin tài khoản Google</h3>
                <p className="mt-1">
                  Khi bạn đăng nhập bằng Google để sử dụng tính năng đồng bộ, chúng tôi thu thập email và tên của bạn thông qua OAuth 2.0.
                  Chúng tôi yêu cầu các quyền sau:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li><strong>calendar.events</strong> — Tạo, đọc, cập nhật sự kiện lịch trên Google Calendar của bạn.</li>
                  <li><strong>calendarlist.readonly</strong> — Đọc danh sách calendar của bạn để bạn chọn nơi import lịch.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-black">Dữ liệu lịch VLU</h3>
                <p className="mt-1">
                  Lịch học và lịch thi được lấy từ cổng thông tin VLU sau khi bạn đăng nhập. Dữ liệu này có thể bao gồm tên môn học, thời gian học hoặc thi, phòng học, giảng viên, mô tả lớp học, và các mã định danh sự kiện cần thiết để xuất file hoặc đồng bộ lịch.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-black">Cookie phiên VLU</h3>
                <p className="mt-1">
                  Tiện ích Chrome đọc một số cookie phiên VLU có sẵn trong trình duyệt của bạn, ví dụ ASP.NET_SessionId và cookie xác thực khi có. Cookie chỉ được gửi tạm thời đến máy chủ CalendarVLU qua HTTPS để kiểm tra phiên đăng nhập và lấy dữ liệu lịch theo yêu cầu của bạn. CalendarVLU không yêu cầu, không thu thập, và không lưu mật khẩu VLU.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">3. Cách chúng tôi sử dụng dữ liệu</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Email và tên: Dùng để xác thực và hiển thị thông tin tài khoản.</li>
              <li>OAuth tokens: Dùng để đồng bộ sự kiện lịch lên Google Calendar theo yêu cầu của bạn.</li>
              <li>Cookie phiên VLU: Chỉ dùng để lấy lịch VLU trong từng yêu cầu, không dùng để đăng nhập thay bạn ngoài mục đích lấy lịch.</li>
              <li>Dữ liệu lịch VLU: Xử lý để tạo sự kiện trên Google Calendar hoặc xuất file CSV/iCal. Dữ liệu lịch không được lưu lâu dài trên máy chủ CalendarVLU.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">4. Lưu trữ và bảo mật</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>OAuth tokens (access token, refresh token) được lưu trữ trong cơ sở dữ liệu MongoDB qua Prisma, chỉ dùng cho mục đích đồng bộ Google Calendar.</li>
              <li>Tokens được làm mới định kỳ và có thể bị thu hồi bất kỳ lúc nào qua trang quản lý tài khoản Google của bạn.</li>
              <li>Cookie VLU và dữ liệu lịch VLU được xử lý tạm thời trong quá trình request để trả kết quả, xuất file, hoặc gửi sự kiện sang Google Calendar theo thao tác của bạn.</li>
              <li>Chúng tôi không lưu trữ mật khẩu VLU và không lưu cookie VLU lâu dài.</li>
              <li>Kết nối giữa tiện ích, máy chủ CalendarVLU, VLU, và Google API sử dụng HTTPS khi truyền dữ liệu trong production.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">5. Chia sẻ dữ liệu</h2>
            <p>
              Chúng tôi không bán, cho thuê, hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba. Dữ liệu của bạn chỉ được truyền đến:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Google API</strong> — Để đồng bộ lịch theo yêu cầu của bạn.</li>
              <li><strong>VLU (online.vlu.edu.vn)</strong> — Để lấy dữ liệu lịch học và lịch thi.</li>
              <li><strong>Máy chủ CalendarVLU</strong> — Để xử lý cookie phiên VLU, chuẩn hóa dữ liệu lịch, xuất file CSV/iCal, và gọi Google Calendar API theo yêu cầu của bạn.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">6. Quyền của bạn</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Bạn có thể thu hồi quyền truy cập Google bất kỳ lúc qua <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="underline">myaccount.google.com/permissions</a>.</li>
              <li>Bạn có thể ngắt kết nối Google Calendar từ tiện ích hoặc yêu cầu xóa toàn bộ dữ liệu tài khoản bằng cách liên hệ với chúng tôi.</li>
              <li>Bạn có thể tải xuống lịch dưới dạng file CSV hoặc iCal bất kỳ lúc nào.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">7. Tuân thủ Google API Services User Data Policy</h2>
            <p>
              CalendarVLU tuân thủ <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="underline">Google API Services User Data Policy</a>, bao gồm các yêu cầu về Limited Use. Việc CalendarVLU sử dụng và chuyển giao thông tin nhận được từ Google APIs sẽ tuân thủ Chrome Web Store User Data Policy, bao gồm các yêu cầu Limited Use.
            </p>
            <p className="mt-3">
              Dữ liệu Google chỉ được dùng để cung cấp tính năng người dùng yêu cầu: xác thực Google, đọc danh sách calendar để bạn chọn calendar đích, tạo hoặc cập nhật sự kiện lịch, và ngắt kết nối tài khoản. CalendarVLU không bán dữ liệu Google, không dùng dữ liệu Google cho quảng cáo, không chia sẻ dữ liệu Google cho bên thứ ba không cần thiết, và không dùng dữ liệu Google để huấn luyện mô hình AI hoặc machine learning.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">8. Liên hệ</h2>
            <p>
              Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:<br />
              Email: <a href="mailto:work.nhkhoa@gmail.com" className="underline">work.nhkhoa@gmail.com</a><br />
              GitHub: <a href="https://github.com/nhkhoa/calendarVLU" target="_blank" rel="noreferrer" className="underline">github.com/nhkhoa/calendarVLU</a>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-black/10 pt-6 text-center">
          <Link href="/" className="text-sm text-black/50 underline underline-offset-4 hover:text-black">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
