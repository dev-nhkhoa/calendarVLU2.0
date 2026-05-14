# Chrome Web Store — Calendar VLU

## Store Listing

**Name:** Calendar VLU — Đồng bộ lịch VLU với Google Calendar

**Short Description (132 chars):**
Đồng bộ lịch học và lịch thi VLU với Google Calendar an toàn. Không cần nhập mật khẩu VLU.

**Full Description:**

Calendar VLU giúp sinh viên Trường Đại học Văn Lang (VLU) đồng bộ lịch học và lịch thi từ hệ thống online.vlu.edu.vn vào Google Calendar một cách an toàn và nhanh chóng.

**Không cần nhập mật khẩu VLU**

Không giống các website yêu cầu bạn nhập thẳng MSSV và mật khẩu VLU, tiện ích này chỉ đọc cookie phiên từ trình duyệt của bạn — nơi bạn đã đăng nhập vào VLU từ trước. Cookie chỉ được dùng một lần duy nhất và không được lưu trữ.

**Cách hoạt động:**

1. Đăng nhập vào online.vlu.edu.vn như bình thường
2. Mở tiện ích Calendar VLU trên thanh Chrome
3. Chọn học kỳ và loại lịch (lịch học / lịch thi)
4. Đồng bộ với Google Calendar hoặc tải file .csv

**Tính năng chính:**

- Đồng bộ lịch học và lịch thi với Google Calendar
- Xuất file .csv để import vào bất kỳ ứng dụng lịch nào
- Hỗ trợ nhiều học kỳ và năm học
- Tự động phát hiện thay đổi lịch
- An toàn, không lưu mật khẩu

**Yêu cầu:**

- Tài khoản VLU (online.vlu.edu.vn)
- Tài khoản Google để đồng bộ Google Calendar (tùy chọn)

## Permission Justification

| Permission | Justification |
|---|---|
| `cookies` (api:online.vlu.edu.vn) | Đọc session cookie của VLU để gửi yêu cầu lấy dữ liệu lịch. Cookie chỉ được dùng một lần, không lưu trữ, không chia sẻ. |
| `storage` | Lưu trạng thái cài đặt và lựa chọn học kỳ của người dùng. |
| `host_permissions` (online.vlu.edu.vn) | Cần thiết để đọc cookie từ domain VLU và gửi yêu cầu API. Phạm vi chỉ giới hạn ở domain VLU chính thức. |
| `host_permissions` (calen-vlu.nhkhoa.live) | Giao tiếp với máy chủ backend để xử lý dữ liệu lịch và đồng bộ Google Calendar. |

## Privacy Practices

- **Không thu thập dữ liệu cá nhân:** Calendar VLU không thu thập, lưu trữ, hoặc chia sẻ dữ liệu cá nhân của người dùng.
- **Không lưu mật khẩu:** Ứng dụng không bao giờ yêu cầu hoặc lưu trữ mật khẩu VLU.
- **Cookie tạm thời:** Cookie VLU chỉ được sử dụng một lần duy nhất trong bộ nhớ đệm và bị xóa ngay sau đó.
- **Minh bạch:** Chính sách bảo mật đầy đủ tại https://calen-vlu.nhkhoa.live/privacy-policy

## Screenshot Ideas

1. **Popup main view** — Hiển thị giao diện chính với các tùy chọn học kỳ và nút đồng bộ
2. **Success state** — Kết quả đồng bộ thành công với số lượng sự kiện
3. **Google Calendar view** — Lịch đã được đồng bộ hiển thị trên Google Calendar

## Support

- Website: https://calen-vlu.nhkhoa.live
- Email: work.nhkhoa@gmail.com
- Privacy Policy: https://calen-vlu.nhkhoa.live/privacy-policy
