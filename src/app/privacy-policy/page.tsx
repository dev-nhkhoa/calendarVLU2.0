import Link from 'next/link'
import Head from 'next/head'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Chính Sách Bảo Mật | Calendar VLU</title>
        <meta name="description" content="Chính sách bảo mật của Calendar VLU" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Chính Sách Bảo Mật - Calendar VLU</h1>
        <p className="text-lg text-gray-600 mb-10 text-center">
          Chào mừng bạn đến với Calendar VLU. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và đảm bảo rằng dữ liệu của bạn được xử lý một cách minh bạch và an toàn.
        </p>

        <div className="bg-white shadow-lg rounded-lg p-8 space-y-8">
          {/* Dữ liệu chúng tôi thu thập */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Dữ liệu chúng tôi thu thập</h2>
            <p className="text-gray-700 mb-3">Khi bạn đăng nhập vào Calendar VLU bằng tài khoản Google, chúng tôi có thể thu thập các thông tin sau:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Họ và tên</li>
              <li>Địa chỉ email</li>
              <li>Thông tin lịch (nếu bạn cấp quyền truy cập Google Calendar)</li>
            </ul>
          </section>

          {/* Cách chúng tôi sử dụng dữ liệu */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Cách chúng tôi sử dụng dữ liệu của bạn</h2>
            <p className="text-gray-700 mb-3">Dữ liệu người dùng Google được sử dụng để:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Xác thực danh tính của bạn khi đăng nhập.</li>
              <li>Đồng bộ hóa lịch của bạn với Google Calendar để quản lý sự kiện.</li>
              <li>Cá nhân hóa trải nghiệm của bạn trong ứng dụng.</li>
            </ul>
          </section>

          {/* Lưu trữ và bảo mật dữ liệu */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Lưu trữ và bảo mật dữ liệu</h2>
            <p className="text-gray-700">
              Dữ liệu của bạn được lưu trữ an toàn trên các máy chủ của Vercel, được mã hóa để đảm bảo an toàn. Chúng tôi chỉ lưu trữ dữ liệu trong thời gian cần thiết để cung cấp dịch vụ.
            </p>
          </section>

          {/* Chia sẻ dữ liệu */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Chia sẻ dữ liệu</h2>
            <p className="text-gray-700">Chúng tôi không chia sẻ dữ liệu người dùng Google của bạn với bất kỳ bên thứ ba nào, trừ khi được yêu cầu bởi pháp luật.</p>
          </section>

          {/* Thay đổi chính sách */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Thay đổi chính sách</h2>
            <p className="text-gray-700">Nếu có bất kỳ thay đổi nào trong cách chúng tôi sử dụng dữ liệu người dùng Google, chúng tôi sẽ thông báo cho bạn qua email hoặc thông báo trong ứng dụng.</p>
          </section>

          {/* Liên hệ */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Liên hệ với chúng tôi</h2>
            <p className="text-gray-700">
              Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email:{' '}
              <a href="mailto:work.nhkhoa@gmail.com" className="text-blue-600 hover:underline">
                work.nhkhoa@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Quay lại{' '}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              Trang chủ
            </Link>
            .
          </p>
        </div>

        <footer className="mt-6 text-center text-gray-500 text-sm">Cập nhật lần cuối: Ngày 10 tháng 03 năm 2025</footer>
      </main>
    </div>
  )
}
