import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Điều Khoản Dịch Vụ</h1>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {/* Giới thiệu */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Giới thiệu</h2>
            <p className="text-gray-700">
              Chào mừng bạn đến với Calendar VLU! Các Điều Khoản Dịch Vụ này điều chỉnh việc bạn sử dụng trang web của chúng tôi tại địa chỉ calen-vlu.nhkhoa.live, tiện ích Chrome, và bất kỳ dịch vụ liên quan nào.
            </p>
          </section>

          {/* Không liên kết với VLU */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Tuyên bố Không Liên kết với VLU</h2>
            <p className="text-gray-700">
              <strong>Calendar VLU là một dự án độc lập và không được liên kết, tài trợ, hoặc xác nhận bởi Trường Đại học Văn Lang (Van Lang University).</strong>{' '}
              Tất cả các nhãn hiệu, tên trường, và dữ liệu từ hệ thống VLU thuộc sở hữu của Trường Đại học Văn Lang. Sản phẩm này chỉ cung cấp công cụ kỹ thuật để chuyển đổi và đồng bộ dữ liệu lịch mà bạn đã có quyền truy cập thông qua tài khoản VLU chính thức của mình.
            </p>
          </section>

          {/* Chấp nhận điều khoản */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Chấp nhận Điều khoản</h2>
            <p className="text-gray-700">
              Bằng cách truy cập và sử dụng dịch vụ này, bạn chấp nhận và đồng ý bị ràng buộc bởi các Điều khoản này và Chính sách Bảo mật của chúng tôi. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ.
            </p>
          </section>

          {/* Sử dụng dịch vụ */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Sử dụng Dịch vụ</h2>
            <div className="text-gray-700 space-y-2">
              <p>Bạn đồng ý:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Chỉ sử dụng dịch vụ cho mục đích hợp pháp (quản lý lịch học và lịch thi cá nhân).</li>
                <li>Không sử dụng dịch vụ để truy cập trái phép dữ liệu của người khác.</li>
                <li>Không lạm dụng API hoặc tiện ích để gây quá tải hệ thống.</li>
                <li>Chịu trách nhiệm về tài khoản VLU và Google của bạn.</li>
              </ul>
            </div>
          </section>

          {/* Giới hạn trách nhiệm */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Giới hạn Trách nhiệm</h2>
            <p className="text-gray-700">
              Calendar VLU được cung cấp &ldquo;như hiện trạng&rdquo; (as is) mà không có bảo đảm nào. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ, bao gồm nhưng không giới hạn ở dữ liệu lịch không chính xác hoặc thời gian chết của dịch vụ. Dịch vụ phụ thuộc vào hệ thống của VLU và Google, do đó chúng tôi không thể bảo đảm tính khả dụng liên tục.
            </p>
          </section>

          {/* Sửa đổi */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Sửa đổi</h2>
            <p className="text-gray-700">
              Chúng tôi có quyền sửa đổi các Điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc chấp nhận các Điều khoản đã sửa đổi.
            </p>
          </section>

          {/* Liên hệ */}
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Liên hệ</h2>
            <p className="text-gray-700">
              Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ qua email{' '}
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

        <footer className="mt-8 text-center text-gray-600 text-sm">
          Cập nhật lần cuối: Tháng 5 năm 2026
        </footer>
      </main>
    </div>
  )
}
