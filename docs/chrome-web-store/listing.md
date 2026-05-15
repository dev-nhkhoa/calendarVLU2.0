# Chrome Web Store — CalendarVLU

## Store Listing

**Name:** CalendarVLU — Đồng bộ lịch VLU với Google Calendar & Outlook

**Short Description (132 chars):**
Đồng bộ lịch học và lịch thi VLU lên Google Calendar và Outlook. An toàn, không cần nhập mật khẩu VLU.

**Full Description:**

CalendarVLU giúp sinh viên Trường Đại học Văn Lang (VLU) đồng bộ lịch học và lịch thi từ hệ thống online.vlu.edu.vn lên Google Calendar và Outlook một cách an toàn và nhanh chóng.

**Không cần nhập mật khẩu VLU**

Không giống các website yêu cầu bạn nhập thẳng MSSV và mật khẩu VLU, tiện ích này chỉ đọc cookie phiên từ trình duyệt của bạn — nơi bạn đã đăng nhập vào VLU từ trước. Cookie chỉ được dùng một lần duy nhất và không được lưu trữ.

**Cách hoạt động:**

1. Đăng nhập vào online.vlu.edu.vn như bình thường
2. Mở tiện ích CalendarVLU trên thanh Chrome
3. Chọn học kỳ và loại lịch (lịch học / lịch thi)
4. Đồng bộ với Google Calendar / Outlook hoặc tải file .csv

**Tính năng chính:**

- Đồng bộ lịch học và lịch thi với Google Calendar
- Đồng bộ lịch với Outlook Calendar
- Xuất file .csv để import vào bất kỳ ứng dụng lịch nào
- Hỗ trợ nhiều học kỳ và năm học
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
| `host_permissions` (calendar-vlu.nhkhoa.site) | Giao tiếp với máy chủ backend để xử lý dữ liệu lịch và đồng bộ Google Calendar. |

## Privacy Practices

- **Không thu thập dữ liệu cá nhân:** CalendarVLU không thu thập, lưu trữ, hoặc chia sẻ dữ liệu cá nhân của người dùng.
- **Không lưu mật khẩu:** Ứng dụng không bao giờ yêu cầu hoặc lưu trữ mật khẩu VLU.
- **Cookie tạm thời:** Cookie VLU chỉ được sử dụng một lần duy nhất trong bộ nhớ đệm và bị xóa ngay sau đó.
- **OAuth 2.0 Limited Scope:** Chỉ yêu cầu quyền đọc danh sách lịch và ghi sự kiện — không thể tạo/xóa lịch.
- **Minh bạch:** Chính sách bảo mật đầy đủ tại https://calendar-vlu.nhkhoa.site/privacy-policy

## Screenshot Ideas

1. **Popup main view** — Hiển thị giao diện chính với các tùy chọn học kỳ và nút đồng bộ
2. **Success state** — Kết quả đồng bộ thành công với số lượng sự kiện
3. **Google Calendar view** — Lịch đã được đồng bộ hiển thị trên Google Calendar

## Support

- Website: https://calendar-vlu.nhkhoa.site
- Email: work.nhkhoa@gmail.com
- Privacy Policy: https://calendar-vlu.nhkhoa.site/privacy-policy
- Terms of Service: https://calendar-vlu.nhkhoa.site/terms
