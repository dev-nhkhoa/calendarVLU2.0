import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

export default function TermsPage() {
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

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Điều khoản dịch vụ</h1>
        <p className="mt-2 text-sm text-black/50">Cập nhật lần cuối: Tháng 5 năm 2026</p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-black/75">
          <section>
            <h2 className="mb-3 text-base font-semibold text-black">1. Giới thiệu</h2>
            <p>
              CalendarVLU là công cụ mã nguồn mở giúp sinh viên trường Đại học Văn Lang (VLU) import lịch học và lịch thi từ cổng thông tin VLU lên Google Calendar hoặc Outlook.
              Bằng cách sử dụng dịch vụ này, bạn đồng ý với các điều khoản dưới đây.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">2. Mô tả dịch vụ</h2>
            <p>
              CalendarVLU cung cấp:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Tiện ích trình duyệt Chrome để đọc lịch học và lịch thi từ tài khoản VLU của bạn.</li>
              <li>Khả năng đồng bộ dữ liệu lịch lên Google Calendar.</li>
              <li>Khả năng xuất dữ liệu lịch dưới dạng file CSV để import vào Outlook hoặc ứng dụng khác.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">3. Tuyên bố không liên kết với VLU</h2>
            <p>
              CalendarVLU là dự án độc lập, không được liên kết, tài trợ hoặc xác nhận bởi Trường Đại học Văn Lang.
              Tên trường và dữ liệu từ hệ thống VLU thuộc sở hữu của Trường Đại học Văn Lang.
              Sản phẩm chỉ cung cấp công cụ kỹ thuật để xử lý dữ liệu mà bạn đã có quyền truy cập thông qua tài khoản VLU chính thức.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">4. Trách nhiệm của người dùng</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Bạn chịu trách nhiệm bảo mật tài khoản VLU và tài khoản Google của mình.</li>
              <li>Bạn chỉ sử dụng dịch vụ cho mục đích quản lý lịch học và lịch thi cá nhân.</li>
              <li>Bạn không được sử dụng dịch vụ để truy cập trái phép dữ liệu của người khác.</li>
              <li>Bạn không được lạm dụng API hoặc tiện ích để gây quá tải hệ thống.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">5. Quyền sở hữu trí tuệ</h2>
            <p>
              CalendarVLU là dự án mã nguồn mở. Mã nguồn được công bố trên{' '}
              <a href="https://github.com/nhkhoa/calendarVLU" target="_blank" rel="noreferrer" className="underline">GitHub</a> theo giấy phép MIT.
              Bạn có thể xem, fork và đóng góp theo quy định của giấy phép.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">6. Giới hạn trách nhiệm</h2>
            <p>
              Dịch vụ được cung cấp &quot;như hiện trạng&quot; (as is) mà không có bảo đảm nào.
              Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ, bao gồm dữ liệu lịch không chính xác, mất dữ liệu, hoặc thời gian chết của dịch vụ.
              Dịch vụ phụ thuộc vào hệ thống của VLU và Google, do đó chúng tôi không thể bảo đảm tính khả dụng liên tục.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">7. Chấm dứt</h2>
            <p>
              Chúng tôi có quyền tạm ngưng hoặc chấm dứt quyền truy cập dịch vụ của bạn bất kỳ lúc nào nếu bạn vi phạm các điều khoản này.
              Bạn có thể ngừng sử dụng dịch vụ bất kỳ lúc nào. Dữ liệu tài khoản Google của bạn có thể được xóa theo yêu cầu.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">8. Thay đổi điều khoản</h2>
            <p>
              Chúng tôi có thể cập nhật các điều khoản này khi cần thiết. Thay đổi sẽ có hiệu lực ngay khi được đăng tải.
              Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc chấp nhận điều khoản đã sửa đổi.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">9. Luật áp dụng</h2>
            <p>Các điều khoản này được điều chỉnh theo pháp luật Việt Nam.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-black">10. Liên hệ</h2>
            <p>
              Nếu bạn có câu hỏi về các điều khoản này, vui lòng liên hệ:<br />
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
