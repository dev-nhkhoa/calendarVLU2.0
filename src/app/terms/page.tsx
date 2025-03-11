// Cho Pages Router: /pages/terms.js
// Hoặc cho App Router: /app/terms/page.js

import Head from 'next/head'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Điều Khoản Dịch Vụ | Calen-VLU</title>
        <meta name="description" content="Điều khoản dịch vụ của Calen-VLU" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Điều Khoản Dịch Vụ</h1>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {/* Giới thiệu */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Giới thiệu</h2>
            <p className="text-gray-700">
              Chào mừng bạn đến với Calen-VLU! Các Điều Khoản Dịch Vụ này điều chỉnh việc bạn sử dụng trang web của chúng tôi tại địa chỉ calen-vlu.nhkhoa.live và bất kỳ dịch vụ liên quan nào do chúng
              tôi cung cấp.
            </p>
          </section>

          {/* Chấp nhận điều khoản */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Chấp nhận Điều khoản</h2>
            <p className="text-gray-700">
              Bằng cách truy cập và sử dụng trang web này, bạn chấp nhận và đồng ý bị ràng buộc bởi các Điều khoản này và Chính sách Bảo mật của chúng tôi. Nếu bạn không đồng ý, vui lòng không sử dụng
              dịch vụ của chúng tôi.
            </p>
          </section>

          {/* Sử dụng dịch vụ */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Sử dụng Dịch vụ</h2>
            <p className="text-gray-700">
              Bạn đồng ý chỉ sử dụng dịch vụ của chúng tôi cho các mục đích hợp pháp và theo cách không xâm phạm quyền lợi của người khác hoặc hạn chế việc sử dụng dịch vụ của họ.
            </p>
          </section>

          {/* Sửa đổi */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Sửa đổi</h2>
            <p className="text-gray-700">
              Chúng tôi có quyền sửa đổi các Điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải. Việc bạn tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận các Điều
              khoản đã sửa đổi.
            </p>
          </section>

          {/* Liên hệ */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Liên hệ</h2>
            <p className="text-gray-700">Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với chúng tôi qua email work.nhkhoa@gmail.com.</p>
          </section>
        </div>

        <footer className="mt-8 text-center text-gray-600 text-sm">Cập nhật lần cuối: Ngày 10 tháng 03 năm 2025</footer>
      </main>
    </div>
  )
}
