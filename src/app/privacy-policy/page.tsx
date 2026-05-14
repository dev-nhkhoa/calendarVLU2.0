import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Chính Sách Bảo Mật</h1>
        <p className="text-lg text-gray-600 mb-10 text-center">
          Calendar VLU cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi xử lý dữ liệu trong mô hình tiện ích Chrome (extension-first architecture).
        </p>

        <div className="bg-white shadow-lg rounded-lg p-8 space-y-8">
          {/* 1. Dữ liệu chúng tôi thu thập */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Dữ liệu chúng tôi thu thập</h2>
            <p className="text-gray-700 mb-3">Calendar VLU được thiết kế để thu thập càng ít dữ liệu càng tốt. Cụ thể:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <strong>Cookie phiên VLU (session cookie):</strong> Khi bạn sử dụng tiện ích Chrome, cookie phiên từ trang online.vlu.edu.vn được đọc một lần duy nhất để gửi yêu cầu lấy lịch. Cookie này{' '}
                <strong>không được lưu trữ</strong> trên máy chủ của chúng tôi, không được ghi vào log, và không được chia sẻ với bên thứ ba.
              </li>
              <li>
                <strong>Thông tin tài khoản Google:</strong> Nếu bạn chọn đồng bộ với Google Calendar, chúng tôi thu thập tên, email, và access token OAuth để tạo và quản lý sự kiện lịch.
              </li>
              <li>
                <strong>Dữ liệu lịch:</strong> Lịch học và lịch thi VLU được xử lý trong bộ nhớ tạm thời và không được lưu trữ lâu dài.
              </li>
            </ul>
          </section>

          {/* 2. Cookie và Session */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Cookie và Session</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                <strong>Cookie kỹ thuật (necessary cookies):</strong> Website của chúng tôi chỉ sử dụng cookie phiên kỹ thuật cần thiết cho hoạt động của ứng dụng (ví dụ: session cookie của Auth.js hoặc Next.js).
              </p>
              <p>
                <strong>Cookie VLU (từ online.vlu.edu.vn):</strong> Cookie phiên của VLU chỉ được tiện ích Chrome đọc khi bạn chủ động nhấn nút đồng bộ. Cookie này được gửi qua HTTPS đến máy chủ của chúng tôi đúng một lần để thực hiện lấy lịch và{' '}
                <strong>không được lưu trữ</strong> sau khi yêu cầu hoàn tất.
              </p>
              <p>
                <strong>Cookie theo dõi (tracking cookies):</strong> Chúng tôi <strong>không</strong> sử dụng cookie theo dõi quảng cáo, cookie của bên thứ ba, hoặc công cụ phân tích nào lưu cookie trên trình duyệt của bạn.
              </p>
            </div>
          </section>

          {/* 3. Mật khẩu VLU */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Mật khẩu VLU</h2>
            <p className="text-gray-700">
              <strong>Calendar VLU không bao giờ yêu cầu, thu thập, lưu trữ, hoặc truyền tải mật khẩu VLU của bạn.</strong>{' '}
              Việc xác thực với VLU diễn ra hoàn toàn trên website chính thức của trường (online.vlu.edu.vn). Chúng tôi không có cơ chế nào để nhận hoặc lưu mật khẩu VLU.
            </p>
          </section>

          {/* 4. Google Calendar Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Dữ liệu Google Calendar</h2>
            <p className="text-gray-700 mb-3">
              Việc đồng bộ với Google Calendar sử dụng giao thức OAuth 2.0. Bạn có thể thu hồi quyền truy cập bất kỳ lúc qua trang quản lý tài khoản Google của mình.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Chúng tôi chỉ tạo và cập nhật sự kiện lịch theo yêu cầu của bạn.</li>
              <li>Chúng tôi không đọc lịch cá nhân khác của bạn.</li>
              <li>Access token OAuth được lưu trữ an toàn trong cơ sở dữ liệu và chỉ được sử dụng cho mục đích đồng bộ.</li>
              <li>Chúng tôi tuân thủ Chính sách Dữ liệu Người dùng của Google API Services.</li>
            </ul>
          </section>

          {/* 5. Lưu trữ và bảo mật */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Lưu trữ và Bảo mật Dữ liệu</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                <strong>Dữ liệu tài khoản Google:</strong> OAuth tokens được lưu trữ trong cơ sở dữ liệu của chúng tôi trên Vercel (Postgres qua Prisma) và được mã hóa.
              </p>
              <p>
                <strong>Dữ liệu lịch:</strong> Dữ liệu lịch VLU được xử lý trong bộ nhớ tạm thời và không được lưu trữ trên máy chủ. Khi bạn tải file .csv, dữ liệu nằm trên máy tính của bạn.
              </p>
              <p>
                <strong>Cookie VLU:</strong> Không được lưu trữ. Xóa bỏ sau khi xử lý yêu cầu.
              </p>
              <p>
                <strong>Thời gian lưu trữ:</strong> Dữ liệu tài khoản Google được giữ cho đến khi bạn hủy liên kết hoặc yêu cầu xóa. Bạn có thể xóa dữ liệu bất kỳ lúc qua trang cài đặt.
              </p>
            </div>
          </section>

          {/* 6. Chia sẻ dữ liệu */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Chia sẻ Dữ liệu</h2>
            <p className="text-gray-700">
              Chúng tôi không bán, cho thuê, hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba, trừ khi được yêu cầu bởi pháp luật hoặc cần thiết để bảo vệ quyền lợi hợp pháp của chúng tôi.
              Dữ liệu lịch VLU không bao giờ được chia sẻ với bất kỳ bên nào khác.
            </p>
          </section>

          {/* 7. Thay đổi chính sách */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Thay đổi Chính sách</h2>
            <p className="text-gray-700">
              Chúng tôi có thể cập nhật chính sách này khi cần thiết. Mọi thay đổi sẽ được đăng tải tại đây và có hiệu lực ngay khi được đăng tải.
            </p>
          </section>

          {/* 8. Liên hệ */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Liên hệ</h2>
            <p className="text-gray-700">
              Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ qua email:{' '}
              <a href="mailto:work.nhkhoa@gmail.com" className="text-blue-600 hover:underline">
                work.nhkhoa@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Quay lại Trang chủ
          </Link>
        </div>

        <footer className="mt-6 text-center text-gray-500 text-sm">
          Cập nhật lần cuối: Tháng 5 năm 2026
        </footer>
      </main>
    </div>
  )
}
