import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="container">
      <h1>Chính sách bảo mật - Calendar VLU</h1>
      <p>
        Chào mừng bạn đến với Calendar VLU. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và đảm bảo rằng dữ liệu của bạn được xử lý một cách minh bạch và an toàn.
      </p>

      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <p>
        Khi bạn đăng nhập vào Calendar VLU bằng tài khoản Google, chúng tôi có thể thu thập các thông tin sau:
      </p>
      <ul>
        <li>Họ và tên</li>
        <li>Địa chỉ email</li>
        <li>Thông tin lịch (nếu bạn cấp quyền truy cập Google Calendar)</li>
      </ul>

      <h2>2. Cách chúng tôi sử dụng dữ liệu của bạn</h2>
      <p>
        Dữ liệu người dùng Google được sử dụng để:
      </p>
      <ul>
        <li>Xác thực danh tính của bạn khi đăng nhập.</li>
        <li>Đồng bộ hóa lịch của bạn với Google Calendar để quản lý sự kiện.</li>
        <li>Cá nhân hóa trải nghiệm của bạn trong ứng dụng.</li>
      </ul>

      <h2>3. Lưu trữ và bảo mật dữ liệu</h2>
      <p>
        Dữ liệu của bạn được lưu trữ an toàn trên các máy chủ của Vercel, được mã hóa để đảm bảo an toàn. Chúng tôi chỉ lưu trữ dữ liệu trong thời gian cần thiết để cung cấp dịch vụ.
      </p>

      <h2>4. Chia sẻ dữ liệu</h2>
      <p>
        Chúng tôi không chia sẻ dữ liệu người dùng Google của bạn với bất kỳ bên thứ ba nào, trừ khi được yêu cầu bởi pháp luật.
      </p>

      <h2>5. Thay đổi chính sách</h2>
      <p>
        Nếu có bất kỳ thay đổi nào trong cách chúng tôi sử dụng dữ liệu người dùng Google, chúng tôi sẽ thông báo cho bạn qua email hoặc thông báo trong ứng dụng.
      </p>

      <h2>6. Liên hệ với chúng tôi</h2>
      <p>
        Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@calendar-vlu.com">support@calendar-vlu.com</a>.
      </p>

      <p>
        Quay lại <Link href="/">Trang chủ</Link>.
      </p>
    </div>
  );
}