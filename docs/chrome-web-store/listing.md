# Chrome Web Store — CalendarVLU

## Store Listing

**Name:** CalendarVLU — Đồng bộ lịch VLU với Google Calendar

**Short Description (132 chars):**
Đồng bộ lịch học và lịch thi VLU lên Google Calendar. Xuất CSV/iCal, không cần nhập mật khẩu VLU.

**Full Description:**

CalendarVLU giúp sinh viên Trường Đại học Văn Lang (VLU) đồng bộ lịch học và lịch thi từ hệ thống online.vlu.edu.vn lên Google Calendar một cách an toàn và nhanh chóng. Bạn cũng có thể xuất lịch ra CSV hoặc iCal để dùng với ứng dụng lịch khác.

**Không cần nhập mật khẩu VLU**

Không giống các website yêu cầu bạn nhập thẳng MSSV và mật khẩu VLU, tiện ích này chỉ đọc cookie phiên từ trình duyệt của bạn — nơi bạn đã đăng nhập vào VLU từ trước. Cookie chỉ được dùng một lần duy nhất và không được lưu trữ.

**Cách hoạt động:**

1. Đăng nhập vào online.vlu.edu.vn như bình thường
2. Mở tiện ích CalendarVLU trên thanh Chrome
3. Chọn học kỳ và loại lịch (lịch học / lịch thi)
4. Đồng bộ với Google Calendar hoặc tải file .csv/.ics

**Tính năng chính:**

- Đồng bộ lịch học và lịch thi với Google Calendar
- Xuất file .csv và .ics để import vào ứng dụng lịch khác
- Hỗ trợ nhiều học kỳ và năm học
- An toàn, không lưu mật khẩu

**Yêu cầu:**

- Tài khoản VLU (online.vlu.edu.vn)
- Tài khoản Google để đồng bộ Google Calendar (tùy chọn)

## Permission Justification

| Permission | Justification |
|---|---|
| `cookies` | Đọc các cookie phiên VLU cần thiết (`ASP.NET_SessionId` và cookie xác thực khi có) để lấy lịch từ `online.vlu.edu.vn` sau khi người dùng đã đăng nhập VLU trong trình duyệt. Cookie được gửi tạm thời qua HTTPS đến backend CalendarVLU cho request hiện tại và không được lưu lâu dài. |
| `storage` | Lưu trạng thái đồng bộ Google, tiến trình job nền, thông báo đăng nhập Google, và trạng thái popup cần khôi phục giữa các lần mở tiện ích. |
| `tabs` | Đọc tab đang active để biết người dùng có đang mở trang VLU không, mở tab OAuth Google khi người dùng chọn kết nối, và theo dõi tab OAuth quay lại backend để cập nhật trạng thái đăng nhập. |
| `alarms` | Giữ service worker đủ ổn định trong lúc job đồng bộ Google Calendar đang chạy theo batch và cập nhật tiến trình nền. |
| `host_permissions` (`https://online.vlu.edu.vn/*`, `https://*.vlu.edu.vn/*`) | Cho phép đọc cookie và tương tác với các subdomain VLU chính thức cần thiết cho lịch học/lịch thi. Production không yêu cầu HTTP host permissions. |
| `host_permissions` (`https://calendar-vlu.nhkhoa.site/*`) | Giao tiếp với backend CalendarVLU để kiểm tra phiên, chuẩn hóa dữ liệu lịch, xuất CSV/iCal, và gọi Google Calendar API theo thao tác của người dùng. |

## Privacy Practices

- **Không lưu mật khẩu:** Ứng dụng không bao giờ yêu cầu hoặc lưu trữ mật khẩu VLU.
- **Cookie phiên VLU:** Cookie VLU được đọc từ trình duyệt và gửi tạm thời qua HTTPS đến backend để lấy lịch theo yêu cầu của người dùng. Cookie không được lưu lâu dài.
- **Dữ liệu lịch VLU:** Tên môn học, lịch học/lịch thi, phòng học, thời gian, mô tả và các trường sự kiện được xử lý để hiển thị, xuất CSV/iCal, hoặc đồng bộ Google Calendar. Dữ liệu lịch không được lưu lâu dài trên backend.
- **Google OAuth:** CalendarVLU lưu token Google để liệt kê calendar, tạo/cập nhật sự kiện theo yêu cầu, và ngắt kết nối khi người dùng chọn.
- **Limited Use:** Việc sử dụng thông tin nhận được từ Google APIs tuân thủ Chrome Web Store User Data Policy, bao gồm Limited Use requirements. Dữ liệu Google không được bán, không dùng cho quảng cáo, không chia sẻ cho bên thứ ba không cần thiết, và không dùng để huấn luyện AI/ML.
- **Minh bạch:** Chính sách bảo mật đầy đủ tại https://calendar-vlu.nhkhoa.site/privacy-policy

## Chrome Web Store Privacy Tab Draft

### Single purpose

CalendarVLU giúp sinh viên VLU lấy lịch học/lịch thi từ online.vlu.edu.vn, xuất CSV/iCal, và đồng bộ các sự kiện đó sang Google Calendar theo thao tác của người dùng.

### User data handled

- Authentication information: VLU session cookies, Google OAuth tokens.
- Personal communications or user content: calendar event content such as course names, schedule times, locations, descriptions, and selected Google Calendar ID.
- Personally identifiable information: Google account email/name returned during OAuth sign-in.

### Data use

- App functionality: required for VLU session verification, calendar parsing/export, Google calendar selection, Google event creation/update, and disconnect.
- No advertising, no sale of data, no unrelated analytics, no AI/ML training from Google user data.

### Data transfer and retention

- Data is transmitted from the extension to https://calendar-vlu.nhkhoa.site over HTTPS.
- VLU cookies are processed per request and are not stored long-term.
- VLU calendar events are processed per request for display/export/sync and are not stored long-term by CalendarVLU.
- Google OAuth tokens are stored server-side so the user can sync and disconnect Google Calendar. Users can revoke access from Google Account permissions or request deletion by email.

## Screenshot Ideas

1. **Popup main view** — Hiển thị giao diện chính với các tùy chọn học kỳ và nút đồng bộ
2. **Success state** — Kết quả đồng bộ thành công với số lượng sự kiện
3. **Google Calendar view** — Lịch đã được đồng bộ hiển thị trên Google Calendar

## Support

- Website: https://calendar-vlu.nhkhoa.site
- Email: work.nhkhoa@gmail.com
- Privacy Policy: https://calendar-vlu.nhkhoa.site/privacy-policy
- Terms of Service: https://calendar-vlu.nhkhoa.site/terms
